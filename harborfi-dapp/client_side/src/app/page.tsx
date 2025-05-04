import {
    ActionsSections,
    FaqSections,
    LearnMore,
  } from "@/components/Sections";
  import { wave } from "@/img";
  import Image from "next/image";
  
  export default function Home() {
    return (
      <>
        <div className={`w-full container h-[100px] mx-auto`}></div>
        <LearnMore />
        <ActionsSections />
        <div className={`w-full container h-[100px] lg:h-[140px] mx-auto`}></div>
        <Image src={wave} alt="wave" className="w-full py-0" />
        <div id="faq-section">
  <FaqSections />
</div>

       
      </> 
    );
  }
  