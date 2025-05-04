import { CallToAct, Hero, UseCases } from "@/Components/Sections";
import KeyFeatures from "@/Components/Sections/KeyFeatures";
import { wave } from "@/img";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Hero />

      <Image
        src={wave}
        alt="wave"
        className="w-full -mt-[90px] 2xl:-mt-[250px]  md:-mt-[120px] xl:-mt-[150px] absolute left-0 "
      />
      <KeyFeatures />

      <UseCases />

      <CallToAct />

      
    </>
  );
}
