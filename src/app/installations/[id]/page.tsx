import InstallationDetail from '@/components/InstallationDetail';

interface InstallationDetailPageProps {
  params: {
    id: string;
  };
}

export default function InstallationDetailPage({ params }: InstallationDetailPageProps) {
  return (
    <div className="container mx-auto py-6">
      <InstallationDetail installationId={params.id} />
    </div>
  );
}
