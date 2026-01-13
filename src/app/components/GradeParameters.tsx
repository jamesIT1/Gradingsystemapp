import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { GradeStructure, GradeComponent } from '@/app/App';

const DEFAULT_STRUCTURE: GradeStructure = {
  classParticipation: {
    total: 70,
    components: [
      { id: '1', name: 'Quizzes', percentage: 25 },
      { id: '2', name: 'Activities', percentage: 25 },
      { id: '3', name: 'Attendance', percentage: 20 },
    ],
  },
  exam: {
    total: 30,
    components: [
      { id: '1', name: 'Midterm Exam', percentage: 15 },
      { id: '2', name: 'Final Exam', percentage: 15 },
    ],
  },
};

export function GradeParameters() {
  const [structure, setStructure] = useState<GradeStructure>(DEFAULT_STRUCTURE);

  useEffect(() => {
    const saved = localStorage.getItem('gradeStructure');
    if (saved) {
      setStructure(JSON.parse(saved));
    }
  }, []);

  const saveStructure = () => {
    const cpTotal = structure.classParticipation.components.reduce((sum, c) => sum + c.percentage, 0);
    const examTotal = structure.exam.components.reduce((sum, c) => sum + c.percentage, 0);

    if (Math.abs(cpTotal - structure.classParticipation.total) > 0.01) {
      toast.error(`Class Participation components must sum to ${structure.classParticipation.total}%`);
      return;
    }

    if (Math.abs(examTotal - structure.exam.total) > 0.01) {
      toast.error(`Exam components must sum to ${structure.exam.total}%`);
      return;
    }

    if (structure.classParticipation.total + structure.exam.total !== 100) {
      toast.error('Total percentage must equal 100%');
      return;
    }

    localStorage.setItem('gradeStructure', JSON.stringify(structure));
    toast.success('Grade parameters saved successfully');
  };

  const addComponent = (type: 'classParticipation' | 'exam') => {
    const newComponent: GradeComponent = {
      id: Date.now().toString(),
      name: '',
      percentage: 0,
    };

    setStructure((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        components: [...prev[type].components, newComponent],
      },
    }));
  };

  const removeComponent = (type: 'classParticipation' | 'exam', id: string) => {
    setStructure((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        components: prev[type].components.filter((c) => c.id !== id),
      },
    }));
  };

  const updateComponent = (
    type: 'classParticipation' | 'exam',
    id: string,
    field: keyof GradeComponent,
    value: string | number
  ) => {
    setStructure((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        components: prev[type].components.map((c) =>
          c.id === id ? { ...c, [field]: field === 'percentage' ? Number(value) : value } : c
        ),
      },
    }));
  };

  const updateTotal = (type: 'classParticipation' | 'exam', value: number) => {
    setStructure((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        total: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900">Grade Parameters</h2>
        <p className="mt-2 text-gray-600">Configure the grading structure for your class</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Class Participation</CardTitle>
            <CardDescription>Configure components that make up class participation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Total Percentage</Label>
              <Input
                type="number"
                value={structure.classParticipation.total}
                onChange={(e) => updateTotal('classParticipation', Number(e.target.value))}
                min={0}
                max={100}
              />
            </div>

            <div className="space-y-3">
              {structure.classParticipation.components.map((component) => (
                <div key={component.id} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">Component Name</Label>
                    <Input
                      value={component.name}
                      onChange={(e) =>
                        updateComponent('classParticipation', component.id, 'name', e.target.value)
                      }
                      placeholder="e.g., Quizzes"
                    />
                  </div>
                  <div className="w-24">
                    <Label className="text-xs">%</Label>
                    <Input
                      type="number"
                      value={component.percentage}
                      onChange={(e) =>
                        updateComponent('classParticipation', component.id, 'percentage', e.target.value)
                      }
                      min={0}
                      max={100}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeComponent('classParticipation', component.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => addComponent('classParticipation')}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Component
            </Button>

            <div className="text-sm text-gray-600">
              Total:{' '}
              {structure.classParticipation.components.reduce((sum, c) => sum + c.percentage, 0)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exam</CardTitle>
            <CardDescription>Configure exam components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Total Percentage</Label>
              <Input
                type="number"
                value={structure.exam.total}
                onChange={(e) => updateTotal('exam', Number(e.target.value))}
                min={0}
                max={100}
              />
            </div>

            <div className="space-y-3">
              {structure.exam.components.map((component) => (
                <div key={component.id} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">Component Name</Label>
                    <Input
                      value={component.name}
                      onChange={(e) => updateComponent('exam', component.id, 'name', e.target.value)}
                      placeholder="e.g., Midterm Exam"
                    />
                  </div>
                  <div className="w-24">
                    <Label className="text-xs">%</Label>
                    <Input
                      type="number"
                      value={component.percentage}
                      onChange={(e) =>
                        updateComponent('exam', component.id, 'percentage', e.target.value)
                      }
                      min={0}
                      max={100}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeComponent('exam', component.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={() => addComponent('exam')} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Component
            </Button>

            <div className="text-sm text-gray-600">
              Total: {structure.exam.components.reduce((sum, c) => sum + c.percentage, 0)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Total Grade Distribution:{' '}
                <span className="font-semibold">
                  {structure.classParticipation.total + structure.exam.total}%
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Must equal 100%</p>
            </div>
            <Button onClick={saveStructure}>Save Parameters</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
