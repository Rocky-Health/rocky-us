import { memo } from "react";
import BenefitItem from "./BenefitItem";
import Link from "next/link";

const SuccessMessage = memo(() => (
    <div id="success-message" className="mt-16">
        <div className="p-8 rounded-lg bg-white flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-start justify-between">
                <div className="mb-6 md:mb-0 md:mr-8 max-w-1/2">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Good News:
                    </h3>
                    <p className="text-xl md:text-3xl font-medium text-[#C19A6B]">
                        You've got options.
                    </p>
                </div>

                <div className="w-full md:w-1/2">
                    <div className="space-y-4">
                        <BenefitItem text="Free online assessment by a licensed provider" />
                        <BenefitItem text="FDA-Approved medications" />
                        <BenefitItem text="Free, discreet shipping if treatment is approved" />
                    </div>

                    <div className="mt-8">
                        <Link
                            href="/ed-prequiz"
                            className="w-full py-3 px-6 rounded-full text-white bg-[#00B67A] hover:bg-[#00A06D] font-medium text-base md:text-lg transition-colors"
                        >
                            Find my treatment
                        </Link>
                        <div className="mt-8 text-xs md:text-xs text-gray-500 max-w-3xl">
                            *Requires an online consultation with a healthcare
                            provider who will determine if a treatment is
                            appropriate. Restrictions apply. See website for
                            full details and important safety information.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
));
SuccessMessage.displayName = "SuccessMessage";

export default SuccessMessage;
