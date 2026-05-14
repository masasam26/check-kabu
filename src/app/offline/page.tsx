export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="text-5xl">📡</div>
      <h2 className="text-xl font-bold text-gray-100">オフラインです</h2>
      <p className="text-gray-400 text-sm max-w-xs">
        インターネット接続がありません。
        <br />
        最後に読み込んだデータをご覧いただけます。
      </p>
    </div>
  );
}
