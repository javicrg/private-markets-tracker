import clsx from 'clsx';
import { TrashIcon } from '@heroicons/react/24/outline';

type Props = {
  type: string;
  date: string;
  percentage: number;
  deleteFn: () => void;
};

export default function ProductInfoCard({
  type,
  date,
  percentage,
  deleteFn,
}: Props) {
  return (
    <div className="group relative flex w-full flex-col rounded-xl border border-border/70 bg-card p-4 text-xs shadow-sm md:w-1/5">
      <button
        className="absolute right-2 top-2 rounded-full p-1 group-hover:bg-primary/10 group-hover:shadow"
        onClick={deleteFn}
      >
        <TrashIcon className="h-4 w-4 text-red-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      </button>
      <div className="flex w-full items-center justify-center">
        <div
          className={clsx('rounded-full px-2 py-1 font-semibold uppercase', {
            'bg-green-200 text-green-500': type === 'realidad',
            'bg-brand/20 text-brand/80': type === 'espectativa',
          })}
        >
          {type}
        </div>
      </div>

      <div className="mt-2">
        <span className="text-muted-foreground">Fecha:</span> {date}
      </div>
      <div>
        <span className="text-muted-foreground">Porcentaje:</span> {percentage}%
      </div>
    </div>
  );
}
