import { Option } from "./option";

export function Preferences() {
  return (
    <section>
      <h3 className="mb-2 px-4 font-medium md:px-8">Preferences</h3>
      <Option label="Change password" />
      <Option label="Change preferred currency" />
    </section>
  );
}
