import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import type { Student } from '@/app/App';

export function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newStudent, setNewStudent] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('students');
    if (saved) {
      setStudents(JSON.parse(saved));
    }
  }, []);

  const saveStudents = (updatedStudents: Student[]) => {
    setStudents(updatedStudents);
    localStorage.setItem('students', JSON.stringify(updatedStudents));
  };

  const handleAddStudent = () => {
    if (!newStudent.studentId || !newStudent.firstName || !newStudent.lastName) {
      toast.error('Please fill in all fields');
      return;
    }

    const exists = students.some((s) => s.studentId === newStudent.studentId);
    if (exists) {
      toast.error('Student ID already exists');
      return;
    }

    const student: Student = {
      id: Date.now().toString(),
      ...newStudent,
    };

    saveStudents([...students, student]);
    setNewStudent({ studentId: '', firstName: '', lastName: '' });
    setIsAdding(false);
    toast.success('Student added successfully');
  };

  const handleDeleteStudent = (id: string) => {
    saveStudents(students.filter((s) => s.id !== id));
    toast.success('Student removed');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Student List</h2>
          <p className="mt-2 text-gray-600">Manage students in your class</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : <><UserPlus className="w-4 h-4 mr-2" />Add Student</>}
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Student</CardTitle>
            <CardDescription>Enter student information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Student ID</Label>
                <Input
                  value={newStudent.studentId}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, studentId: e.target.value })
                  }
                  placeholder="e.g., 2024001"
                />
              </div>
              <div>
                <Label>First Name</Label>
                <Input
                  value={newStudent.firstName}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, firstName: e.target.value })
                  }
                  placeholder="John"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={newStudent.lastName}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, lastName: e.target.value })
                  }
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleAddStudent}>
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Students ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No students added yet</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>First Name</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.studentId}</TableCell>
                      <TableCell>{student.lastName}</TableCell>
                      <TableCell>{student.firstName}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
