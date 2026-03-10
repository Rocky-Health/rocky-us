import Link from "next/link";

const EdFooter = () => {
  return (
    <>
      <footer className="bg-black text-[#efe7df] p-4 text-center">
        <img
          src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-white.webp"
          className=" w-[180px]  mx-auto my-4"
        />
        <img
          src="https://static.legitscript.com/seals/44796030.png"
          className="w-[80px] h-[80px] mx-auto my-4"
        />

        <Link
          key="0"
          href="/terms-of-use/"
          className="underline text-xl hover:underline min-w-fit mr-4"
        >
          Terms of Use
        </Link>

        <Link
          key="1"
          href="/privacy-policy/"
          className="underline text-xl hover:underline min-w-fit"
        >
          Privacy Policy
        </Link>
        <hr className="mt-8 mb-4 w-[80%] ml-[10%] border-[#AEAEAE]" />
        <p className="text-[#AEAEAE]">
          ©{new Date().getFullYear()} MyRocky Health Inc. All rights reserved.
          MyRocky Health Pharmacy Inc. & MyRocky Health Clinic Inc. are subsidiaries
          of MyRocky Health Inc.
        </p>
      </footer>
    </>
  );
};

export default EdFooter;
