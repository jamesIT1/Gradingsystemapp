import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Lock, Unlock, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { Student, StudentGrade, GradeStructure } from '@/app/App';

interface GradingSheetProps {
  userPassword: string;
}

export function GradingSheet({ userPassword }: GradingSheetProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, StudentGrade>>({});
  const [structure, setStructure] = useState<GradeStructure | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    const savedStudents = localStorage.getItem('students');
    const savedGrades = localStorage.getItem('grades');
    const savedStructure = localStorage.getItem('gradeStructure');
    const savedLockState = localStorage.getItem('gradesLocked');

    if (savedStudents) setStudents(JSON.parse(savedStudents));
    if (savedGrades) setGrades(JSON.parse(savedGrades));
    if (savedStructure) setStructure(JSON.parse(savedStructure));
    if (savedLockState) setIsLocked(savedLockState === 'true');
  }, []);

  const saveGrades = () => {
    localStorage.setItem('grades', JSON.stringify(grades));
    toast.success('Grades saved successfully');
  };

  const toggleLock = () => {
    if (isLocked) {
      setShowUnlockDialog(true);
    } else {
      setIsLocked(true);
      localStorage.setItem('gradesLocked', 'true');
      toast.success('Grades locked');
    }
  };

  const handleUnlock = () => {
    if (passwordInput === userPassword) {
      setIsLocked(false);
      localStorage.setItem('gradesLocked', 'false');
      setShowUnlockDialog(false);
      setPasswordInput('');
      toast.success('Grades unlocked');
    } else {
      toast.error('Incorrect password');
    }
  };

  const updateGrade = (studentId: string, type: 'classParticipation' | 'exam', componentId: string, value: number) => {
    setGrades((prev) => {
      const studentGrade = prev[studentId] || {
        studentId,
        classParticipationGrades: {},
        examGrades: {},
      };

      const field = type === 'classParticipation' ? 'classParticipationGrades' : 'examGrades';
      
      return {
        ...prev,
        [studentId]: {
          ...studentGrade,
          [field]: {
            ...studentGrade[field],
            [componentId]: value,
          },
        },
      };
    });
  };

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

  const calculateFinalGrade = (studentId: string, type: 'midterm' | 'final'): number => {
    if (!structure) return 0;

    const cpGrade = calculateComponentGrade(studentId, 'classParticipation');
    const examGrade = calculateComponentGrade(studentId, 'exam');

    const cpTotal = (cpGrade * structure.classParticipation.total) / 100;
    const examTotal = (examGrade * structure.exam.total) / 100;

    return cpTotal + examTotal;
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
          <p>Please add students first</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Grading Sheet</h2>
          <p className="mt-2 text-gray-600">Enter and manage student grades</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={saveGrades} disabled={isLocked}>
            <Save className="w-4 h-4 mr-2" />
            Save Grades
          </Button>
          <Button variant={isLocked ? 'destructive' : 'default'} onClick={toggleLock}>
            {isLocked ? (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Unlock
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Lock
              </>
            )}
          </Button>
        </div>
      </div>

      {isLocked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <Lock className="w-4 h-4 inline mr-2" />
            Grades are currently locked. Click "Unlock" to edit.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Student Grades</CardTitle>
          <CardDescription>All grades are out of 100</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-white z-10">Student ID</TableHead>
                  <TableHead className="sticky left-24 bg-white z-10">Name</TableHead>
                  {structure.classParticipation.components.map((component) => (
                    <TableHead key={component.id}>{component.name}</TableHead>
                  ))}
                  <TableHead>CP Total</TableHead>
                  {structure.exam.components.map((component) => (
                    <TableHead key={component.id}>{component.name}</TableHead>
                  ))}
                  <TableHead>Exam Total</TableHead>
                  <TableHead>Midterm</TableHead>
                  <TableHead>Final</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="sticky left-0 bg-white font-medium">{student.studentId}</TableCell>
                    <TableCell className="sticky left-24 bg-white">{`${student.lastName}, ${student.firstName}`}</TableCell>
                    {structure.classParticipation.components.map((component) => (
                      <TableCell key={component.id}>
                        <Input
                          type="number"
                          className="w-20"
                          min={0}
                          max={100}
                          value={grades[student.id]?.classParticipationGrades[component.id] || ''}
                          onChange={(e) =>
                            updateGrade(student.id, 'classParticipation', component.id, Number(e.target.value))
                          }
                          disabled={isLocked}
                        />
                      </TableCell>
                    ))}
                    <TableCell className="font-semibold">
                      {calculateComponentGrade(student.id, 'classParticipation').toFixed(2)}
                    </TableCell>
                    {structure.exam.components.map((component) => (
                      <TableCell key={component.id}>
                        <Input
                          type="number"
                          className="w-20"
                          min={0}
                          max={100}
                          value={grades[student.id]?.examGrades[component.id] || ''}
                          onChange={(e) =>
                            updateGrade(student.id, 'exam', component.id, Number(e.target.value))
                          }
                          disabled={isLocked}
                        />
                      </TableCell>
                    ))}
                    <TableCell className="font-semibold">
                      {calculateComponentGrade(student.id, 'exam').toFixed(2)}
                    </TableCell>
                    <TableCell className="font-semibold bg-blue-50">
                      {calculateFinalGrade(student.id, 'midterm').toFixed(2)}
                    </TableCell>
                    <TableCell className="font-semibold bg-green-50">
                      {calculateFinalGrade(student.id, 'final').toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Grades</DialogTitle>
            <DialogDescription>Enter your password to unlock and edit grades</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                placeholder="Enter password"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowUnlockDialog(false);
                setPasswordInput('');
              }}>
                Cancel
              </Button>
              <Button onClick={handleUnlock}>Unlock</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
