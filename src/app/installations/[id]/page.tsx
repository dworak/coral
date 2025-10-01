import InstallationDetail from '@/components/InstallationDetail';

interface InstallationDetailPageProps {
  params: {
    id: string;
  };
}

export default function InstallationDetailPage({ params }: InstallationDetailPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <InstallationDetail installationId={params.id} />
      </div>
    </div>
  );
}
