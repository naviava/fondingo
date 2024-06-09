import Image from "next/image";
import { uuid } from "@fondingo/utils/uuid";
import { cn } from "@fondingo/ui/utils";
import { archivo } from "~/utils";

const FEATURES = [
  {
    id: uuid(),
    adjective: "Effortless",
    title: "Expense Tracking",
    description:
      "Easily log and categorize your expenses, so you can stay on top of your spending. With FSplit, keeping track of every penny has never been simpler.",
    icon: "/images/key-feature-1.svg",
  },
  {
    id: uuid(),
    adjective: "Seamless",
    title: "Bill Splitting",
    description:
      "Split bills with friends and family in just a few steps. Whether it's dining out, traveling, or shared household expenses, FSplit ensures everyone pays their fair share.",
    icon: "/images/key-feature-2.svg",
  },
  {
    id: uuid(),
    adjective: "Simplified",
    title: "Debt Management",
    description:
      "Easily manage and track who owes what. FSplit keeps all your group expenses organized, so you can focus on enjoying your time together without worrying about the finances.",
    icon: "/images/key-feature-3.svg",
  },
  {
    id: uuid(),
    adjective: "Easy",
    title: "Reimbursements",
    description:
      "Get paid back swiftly. FSplit simplifies the reimbursement process, making it easy to settle up with friends and family.",
    icon: "/images/key-feature-4.svg",
  },
];

export function KeyFeatures() {
  return (
    <div className={cn("mx-auto mt-52 max-w-screen-xl", archivo.className)}>
      <h2 className="lg:leading-tighter mx-auto text-center text-3xl font-bold tracking-tighter sm:text-4xl md:max-w-[70%] md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
        What do you get?
      </h2>
      <ul className="mx-auto mt-6 grid grid-cols-1 place-items-center gap-x-6 gap-y-8 p-6 md:mt-14 md:max-w-[90%] md:grid-cols-2 md:gap-y-14 md:p-0 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <li
            key={feature.id}
            className="flex w-full max-w-[280px] flex-col items-center justify-center rounded-xl bg-neutral-200 pb-3 pt-6"
          >
            <div className="relative mb-4 aspect-square w-14">
              <Image
                fill
                src={feature.icon}
                alt={feature.adjective + feature.title}
              />
            </div>
            <div className="text-xl font-bold tracking-wider">
              <span className="text-cta">{feature.adjective[0]}</span>
              {feature.adjective.slice(1)}
            </div>
            <span className="text-neutral-500">{feature.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
