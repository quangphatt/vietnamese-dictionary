export const Loading = ({ loadingMessage }: { loadingMessage?: string }) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-gray-400 mt-4">{loadingMessage || "Đang tải..."}</p>
      </div>
    </div>
  );
};
