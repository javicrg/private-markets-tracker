export function InfoFondoSkeleton() {
  return (
    <>
      <div className="mx-auto w-full">
        <div className="animate-shimmer mb-2 h-6 rounded-md bg-gray-300 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
        <div className="animate-shimmer h-36 rounded-md bg-gray-300 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
      </div>
    </>
  );
}

export function ChartSkeleton() {
  return (
    <div className="animate-shimmer my-10 h-96 rounded-md bg-gray-300 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
  );
}
