"use client";

import { Option } from "./option";

interface IProps {}

export function Feedback({}: IProps) {
  return (
    <div>
      <h3 className="mb-2 px-4 font-medium md:px-8">Feedback</h3>
      <Option label="Rate Fondisplit" />
      <Option label="Contact us" />
    </div>
  );
}
