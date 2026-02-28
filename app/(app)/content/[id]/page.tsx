interface ContentPageProps {
    params: { id: string };
}

export default function ContentPage({ params }: ContentPageProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full py-24">
            <h1 className="text-2xl font-semibold text-foreground">Content: {params.id}</h1>
            <p className="text-muted-foreground text-sm mt-2">Content detail view coming soon.</p>
        </div>
    );
}
