"use client";

import { Option } from "./option";

interface IProps {}

export function Preferences({}: IProps) {
  return (
    <div className="space-y-3">
      <h3 className="mb-2 px-4 font-medium md:px-8">Preferences</h3>
      <Option label="Change password" />
    </div>
  );
}
