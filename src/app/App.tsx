import { useState, useEffect } from 'react';
import { LoginPage } from '@/app/components/LoginPage';
import { GradeParameters } from '@/app/components/GradeParameters';
import { StudentList } from '@/app/components/StudentList';
import { GradingSheet } from '@/app/components/GradingSheet';
import { ReportPage } from '@/app/components/ReportPage';
import { Button } from '@/app/components/ui/button';
import { LogOut } from 'lucide-react';

export interface GradeComponent {
  id: string;
  name: string;
  percentage: number;
}

export interface GradeStructure {
  classParticipation: {
    total: number;
    components: GradeComponent[];
  };
  exam: {
    total: number;
    components: GradeComponent[];
  };
}

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
}

export interface StudentGrade {
  studentId: string;
  classParticipationGrades: Record<string, number>; // componentId -> grade
  examGrades: Record<string, number>; // componentId -> grade
  midtermGrade?: number;
  finalGrade?: number;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<'parameters' | 'students' | 'grading' | 'report'>('parameters');
  const [password, setPassword] = useState('');

  // Load login state
  useEffect(() => {
    const savedPassword = localStorage.getItem('professorPassword');
    const savedLoginState = localStorage.getItem('isLoggedIn');
    if (savedPassword && savedLoginState === 'true') {
      setPassword(savedPassword);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (pwd: string) => {
    setPassword(pwd);
    setIsLoggedIn(true);
    localStorage.setItem('professorPassword', pwd);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    setCurrentPage('parameters');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Professor Grading System</h1>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
          <nav className="mt-4 flex gap-2">
            <Button
              variant={currentPage === 'parameters' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('parameters')}
            >
              Grade Parameters
            </Button>
            <Button
              variant={currentPage === 'students' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('students')}
            >
              Student List
            </Button>
            <Button
              variant={currentPage === 'grading' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('grading')}
            >
              Grading Sheet
            </Button>
            <Button
              variant={currentPage === 'report' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('report')}
            >
              Report
            </Button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {currentPage === 'parameters' && <GradeParameters />}
        {currentPage === 'students' && <StudentList />}
        {currentPage === 'grading' && <GradingSheet userPassword={password} />}
        {currentPage === 'report' && <ReportPage />}
      </main>
    </div>
  );
}
