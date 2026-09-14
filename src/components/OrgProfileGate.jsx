import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { isOrgProfileComplete } from '../../utils/orgProfile';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';

/**
 * Soft gate banner when organization profile is incomplete.
 * AI features require org_type and org_size.
 */
export function OrgProfileGate({ className = '' }) {
  const { user } = useAuth();

  if (isOrgProfileComplete(user)) return null;

  return (
    <Card className={`border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 ${className}`}>
      <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 text-sm text-amber-900 dark:text-amber-200">
          <Building2 size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">أكمل ملف منظمتك أولاً</p>
            <p className="mt-1 text-amber-800/90 dark:text-amber-300/90">
              الملخص الذكي والمساعد وتحليل المشروع يحتاجان نوع المنظمة وحجمها وعدد الأعضاء.
            </p>
          </div>
        </div>
        <Link to="/profile?onboarding=1">
          <Button variant="secondary" className="shrink-0">
            إكمال الملف الشخصي
          </Button>
        </Link>
      </CardBody>
    </Card>
  );
}
