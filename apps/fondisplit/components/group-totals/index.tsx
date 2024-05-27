interface IProps {
  userId: string | null | undefined;
  groupId: string;
}

export function GroupTotals({ userId = "", groupId }: IProps) {
  return (
    <>
      <h3 className="mb-6 px-4 text-lg font-semibold">
        Group spending summary
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h5>Total group spending</h5>
        </div>
      </div>
    </>
  );
}
