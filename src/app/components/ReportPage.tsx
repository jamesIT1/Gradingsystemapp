import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Download, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import type { Student, StudentGrade, GradeStructure } from '@/app/App';

export function ReportPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, StudentGrade>>({});
  const [structure, setStructure] = useState<GradeStructure | null>(null);

  useEffect(() => {
    const savedStudents = localStorage.getItem('students');
    const savedGrades = localStorage.getItem('grades');
    const savedStructure = localStorage.getItem('gradeStructure');

    if (savedStudents) setStudents(JSON.parse(savedStudents));
    if (savedGrades) setGrades(JSON.parse(savedGrades));
    if (savedStructure) setStructure(JSON.parse(savedStructure));
  }, []);

  const calculateComponentGrade = (studentId: string, type: 'classParticipation' | 'exam'): number => {
    if (!structure) return 0;

    const components = structure[type].components;
    const studentGrade = grades[studentId];
    if (!studentGrade) return 0;

    const gradeMap = type === 'classParticipation' ? studentGrade.classParticipationGrades : studentGrade.examGrades;
    
    let total = 0;
    components.forEach((component) => {
      const grade = gradeMap[component.id] || 0;
      total += (grade * component.percentage) / 100;
    });

    return total;
  };

  const calculateFinalGrade = (studentId: string): number => {
    if (!structure) return 0;

    const cpGrade = calculateComponentGrade(studentId, 'classParticipation');
    const examGrade = calculateComponentGrade(studentId, 'exam');

    const cpTotal = (cpGrade * structure.classParticipation.total) / 100;
    const examTotal = (examGrade * structure.exam.total) / 100;

    return cpTotal + examTotal;
  };

  const getRemarks = (grade: number): string => {
    if (grade >= 90) return 'Excellent';
    if (grade >= 80) return 'Very Good';
    if (grade >= 70) return 'Good';
    if (grade >= 60) return 'Satisfactory';
    if (grade >= 50) return 'Passing';
    return 'Failed';
  };

  const exportToExcel = () => {
    if (!structure) {
      toast.error('Grade structure not configured');
      return;
    }

    // Prepare data for Excel
    const excelData = students.map((student) => {
      const cpGrade = calculateComponentGrade(student.id, 'classParticipation');
      const examGrade = calculateComponentGrade(student.id, 'exam');
      const midtermGrade = calculateFinalGrade(student.id);
      const finalGrade = calculateFinalGrade(student.id);

      const row: any = {
        'Student ID': student.studentId,
        'Last Name': student.lastName,
        'First Name': student.firstName,
      };

      // Add class participation components
      structure.classParticipation.components.forEach((component) => {
        row[component.name] = grades[student.id]?.classParticipationGrades[component.id] || 0;
      });
      row['Class Participation Total'] = cpGrade.toFixed(2);

      // Add exam components
      structure.exam.components.forEach((component) => {
        row[component.name] = grades[student.id]?.examGrades[component.id] || 0;
      });
      row['Exam Total'] = examGrade.toFixed(2);

      row['Midterm Grade'] = midtermGrade.toFixed(2);
      row['Final Grade'] = finalGrade.toFixed(2);
      row['Remarks'] = getRemarks(finalGrade);

      return row;
    });

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Grades Report');

    // Auto-size columns
    const maxWidth = 20;
    const colWidths = Object.keys(excelData[0] || {}).map((key) => ({
      wch: Math.min(Math.max(key.length, 10), maxWidth),
    }));
    worksheet['!cols'] = colWidths;

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `Grades_Report_${date}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);
    toast.success('Report exported successfully');
  };

  if (!structure) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <p>Please configure grade parameters first</p>
        </CardContent>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <p>No students to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Grade Report</h2>
          <p className="mt-2 text-gray-600">View and export student grades</p>
        </div>
        <Button onClick={exportToExcel} className="gap-2">
          <Download className="w-4 h-4" />
          Export to Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Student Grade Summary
          </CardTitle>
          <CardDescription>Final grades and remarks for all students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class Participation</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Midterm Grade</TableHead>
                  <TableHead>Final Grade</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const cpGrade = calculateComponentGrade(student.id, 'classParticipation');
                  const examGrade = calculateComponentGrade(student.id, 'exam');
                  const midtermGrade = calculateFinalGrade(student.id);
                  const finalGrade = calculateFinalGrade(student.id);
                  const remarks = getRemarks(finalGrade);

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.studentId}</TableCell>
                      <TableCell>{`${student.lastName}, ${student.firstName}`}</TableCell>
                      <TableCell>{cpGrade.toFixed(2)}</TableCell>
                      <TableCell>{examGrade.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">{midtermGrade.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">{finalGrade.toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            finalGrade >= 90
                              ? 'bg-green-100 text-green-800'
                              : finalGrade >= 80
                              ? 'bg-blue-100 text-blue-800'
                              : finalGrade >= 70
                              ? 'bg-yellow-100 text-yellow-800'
                              : finalGrade >= 60
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {remarks}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['Excellent', 'Very Good', 'Good', 'Satisfactory', 'Passing', 'Failed'].map((remark) => {
              const count = students.filter((student) => {
                const grade = calculateFinalGrade(student.id);
                return getRemarks(grade) === remark;
              }).length;

              return (
                <div key={remark} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <div className="text-sm text-gray-600 mt-1">{remark}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
