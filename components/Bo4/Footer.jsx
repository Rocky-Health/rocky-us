import Link from "next/link";
import Logo from "../Navbar/Logo";
import Section from "../utils/Section";
import CustomImage from "../utils/CustomImage";

const Footer = () => {
    return (<>
    <Section bg={`bg-black`}>
        <div className=" flex flex-col gap-4 justify-center items-center">
          <CustomImage src={`/bo4/whiteLogo.png`} width={160} height={40} alt="Footer Image" className={`w-[111px] h-[28px] md:w-[160px] md:h-[40px]`} />
            <div className="flex flex-row gap-2 justify-center items-center"> 
                 <Link href="/privacy" className ="font-poppins font-normal text-sm leading-6 tracking-normal align-middle underline decoration-solid text-[#FFFFFFA6]"> Privacy Policy </Link> 
            <Link href="/terms" className ="font-poppins font-normal text-sm leading-6 tracking-normal align-middle underline decoration-solid text-[#FFFFFFA6]"> Terms of Use </Link>
        
            </div>

           </div>
    </Section>
    </>);
}

export default Footer;