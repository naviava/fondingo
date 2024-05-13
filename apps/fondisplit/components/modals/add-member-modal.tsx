import { useAddMemberModal } from "@fondingo/store/fondisplit";

export function AddMemberModal() {
  const { isOpen, onClose } = useAddMemberModal();

  return <div>AddMemberModal</div>;
}
