import YourWeightPopup from "./YourWeightPopup";
import React, { useEffect } from "react";
import Notes from "./Notes";

import CustomImage from "@/components/utils/CustomImage";
import Counter from "./Counter";
import WeightLossResultPopup from "./WeightLossResultPopup";
import WeightLossResultPasswordPopup from "./WeightLossResultPasswordPopup";
import ProgressCycle from "./ProgressCycle";
import { ProgressBar } from "@/components/EdQuestionnaire/ProgressBar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QuestionnaireNavbar from "./QuestionnaireNavbar";

const GenericPopup = ({
  isOpen,
  onClose,
  popupConfig,
  onAction,
  currentPage,
  setUserData,
  progressBar,
  asPage = false,
}) => {
  const router = useRouter();
  useEffect(() => {
    if (asPage) return; // when used as a full page, don't lock body scroll
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup when unmounting
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, asPage]);

  if (!isOpen || !popupConfig) return null;

  const handleButtonClick = (button) => {
    switch (button.action) {
      case "redirect":
        if (button.url.startsWith("http") || button.url.includes("://")) {
          window.location.href = button.url; // External URLs
        } else {
          router.push(button.url); // Internal navigation
        }
        break;
      case "continue":
        onAction("continue");
        break;
      case "openPopup":
        if (button.popupName) {
          onAction("showPopup", button.popupName);
        }
        break;
      case "navigate":
        if (button.payload) {
          onClose();
          onAction("navigate", button.payload);
        }
        break;
      case "close":
      default:
        onClose();
        break;
    }
  };

  const getTitleColor = () => {
    if (popupConfig.titleColor === "red") return "text-red-600";
    return "text-[#C19A6B]"; // Use WL title color as default
  };

  const rootClass = asPage
    ? "min-h-screen bg-white flex flex-col overflow-auto"
    : "fixed inset-0 top-0 bg-[#F5F4EF] !z-[999999] flex items-start justify-start overflow-auto w-full h-full";

  return (
    <div
      className={rootClass}
      style={{
        animation: isOpen
          ? "fadeIn 0.3s ease-in-out"
          : "fadeOut 0.3s ease-in-out",
      }}
    >
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `}</style>

      {asPage && (
        <>
          {popupConfig.isWL && (
            <div className="bg-black text-white text-[14px] leading-[140%] font-medium items-center text-center p-2 ">
              Lose Weight or Your Money Back
            </div>
          )}
          <QuestionnaireNavbar
            onBackClick={onClose}
            currentPage={currentPage + 1}
          />
          {/* Progress Bar - Hide for recommendation step */}
          {currentPage !== 16 && (
            <div className="">
              <ProgressBar
                progress={
                  progressBar >= 100
                    ? 100
                    : popupConfig.progress || progressBar + 2
                }
              />
            </div>
          )}
        </>
      )}

      <div
        className={
          asPage
            ? "flex-1 flex items-start justify-center overflow-auto"
            : "flex-1 flex items-start justify-start overflow-auto"
        }
      >
        <div
          className={
            asPage
              ? "w-full md:w-[520px] mt-4 max-w-xl relative flex flex-col"
              : "w-full h-full relative flex flex-col "
          }
        >
          {!asPage && (
            <div className="flex items-center flex-col">
              {popupConfig.isWL == true && (
                <div className="bg-black text-white text-[14px] leading-[140%] font-medium items-center text-center p-2 mb-2 w-full">
                  Lose Weight or Your Money Back
                </div>
              )}
              <Link href="/">
                <CustomImage
                  width="100"
                  height="100"
                  className={`mb-16 ${popupConfig.isWL ? "" : "mt-6"}`}
                  src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp"
                />
              </Link>
            </div>
          )}

          <div
            className={
              popupConfig.title === "You want something..."
                ? "flex justify-start items-start"
                : "flex justify-start items-start md:justify-center md:items-center"
            }
          >
            <div
              className={` px-8 md:px-0 max-w-lg flex flex-col  ${
                popupConfig.contentAlign === "left"
                  ? "items-start"
                  : "items-center justify-center mx-auto"
              }`}
            >
              {/* Optional image */}

              {popupConfig.image && popupConfig.imageTop == true && (
                <div className={asPage ? "mx-auto" : "w-full"}>
                  <CustomImage
                    width="1000"
                    height="1000"
                    src={popupConfig.image}
                    alt={popupConfig.title}
                    className={
                      popupConfig.imageStyle
                        ? popupConfig.imageStyle
                        : "rounded-lg w-[335px] h-[324px]"
                    }
                  />
                </div>
              )}

              {popupConfig.component === "ProgressCycle" && (
                <div className="mb-[24px]">
                  <ProgressCycle showTitles={popupConfig.showTitles} />
                </div>
              )}

              {popupConfig.component !== "Counter" && popupConfig.title && (
                <h3
                  className={
                    popupConfig.headerStyle
                      ? popupConfig.headerStyle
                      : `text-[26px] md:text-[32px]  headers-font ${getTitleColor()} leading-[140%] mb-8`
                  }
                >
                  {popupConfig.titleIsHtml ? (
                    <span
                      dangerouslySetInnerHTML={{ __html: popupConfig.title }}
                    />
                  ) : (
                    popupConfig.title
                  )}
                </h3>
              )}

              {popupConfig.component === "Counter" ? (
                <Counter
                  seconds={popupConfig.seconds || 3}
                  texts={popupConfig.texts || []}
                  title={popupConfig.title}
                  onAction={onAction}
                />
              ) : popupConfig.component === "WeightLossResultPopup" ? (
                <WeightLossResultPopup
                  onAction={onAction}
                  setUserData={setUserData}
                />
              ) : popupConfig.component === "WeightLossResultPasswordPopup" ? (
                <WeightLossResultPasswordPopup
                  onSubmit={onAction}
                  setUserData={setUserData}
                />
              ) : popupConfig.component === "YourWeightPopup" ? (
                <YourWeightPopup
                  weight={popupConfig.text}
                  onAction={onAction}
                  setUserData={setUserData}
                />
              ) : (
                <div
                  className={
                    popupConfig.messageStyle
                      ? popupConfig.messageStyle
                      : "text-[14px] md:text-[16px] leading-[140%] mb-6"
                  }
                >
                  {popupConfig.message &&
                    popupConfig.message
                      .split("\n")
                      .map((line, index) => (
                        <p
                          key={index}
                          className={index > 0 ? "mt-4" : ""}
                          dangerouslySetInnerHTML={{ __html: line }}
                        />
                      ))}
                </div>
              )}

              {popupConfig.content && (
                <div>
                  {typeof popupConfig.content === "string" ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: popupConfig.content }}
                    />
                  ) : (
                    popupConfig.content
                  )}
                </div>
              )}

              {/* Optional image */}
              {popupConfig.image && popupConfig.imageTop === false && (
                <div className={asPage ? "mx-auto" : "w-full"}>
                  <CustomImage
                    width="1000"
                    height="1000"
                    src={popupConfig.image}
                    alt={popupConfig.title}
                    className={
                      popupConfig.imageStyle
                        ? popupConfig.imageStyle
                        : "rounded-lg w-auto h-[350px] md:w-[335px] md:h-[324px]"
                    }
                  />
                </div>
              )}

              {popupConfig.messageAfterImage && (
                <>
                  <div className="text-[14px] font-medium leading-[140%] text-center mb-2">
                    {popupConfig.messageAfterImage}
                  </div>
                </>
              )}

              {popupConfig.showGLP1Desc && (
                <>
                  <p className="text-[14px] leading-[140%] mb-[16px] text-center">
                    GLP-1 is a natural hormone released in your gut after
                    eating. It slows digestion, reduces appetite, and improves
                    blood sugar regulation.
                  </p>
                  <p className="text-[14px] leading-[140%] mb-[24px] text-center">
                    Medications like semaglutide mimic this effect — helping
                    your body feel full faster, cut cravings, and burn fat more
                    efficiently.
                  </p>
                </>
              )}

              {popupConfig.notes && Array.isArray(popupConfig.notes) && (
                <div className="flex flex-col gap-2 my-4">
                  {popupConfig.notes.map((note, idx) => (
                    <Notes key={idx} type={note.type} message={note.message} />
                  ))}
                </div>
              )}

              {popupConfig.OnAverageMessage == true && (
                <>
                  <div>
                    <p className="text-[11px] font-normal leading-[140%] text-[#212121] mb-4">
                      *On average, through lifestyle changes, treatment and
                      support, Rocky members lose 12% of their weight in 6
                      months.
                    </p>
                  </div>
                </>
              )}

              {popupConfig.PrivacyText == true && (
                <>
                  <div className="text-[10px] leading-[140%] font-medium text-[#BABABA] mt-2 mb-24">
                    We respect your privacy. All of your information is securely
                    stored on our HIPPA Compliant server.
                  </div>
                </>
              )}

              {/* Fixed bottom button area - matches WL design */}
              <div
                className="fixed  bottom-0 left-0 w-full px-4 pb-4 flex items-center justify-center z-50 bg-white/90 backdrop-blur-sm"
                style={{ boxShadow: "0 -12px 30px rgba(255,255,255,0.95)" }}
              >
                <div
                  className={
                    asPage
                      ? "w-[400px] md:w-[520px] max-w-xl flex flex-col items-center justify-center gap-3"
                      : "w-full flex flex-col items-center justify-center gap-3"
                  }
                >
                  {popupConfig.GroverText == true && (
                    <div className=" max-w-lg pb-4 font-poppins font-medium text-[10px] text-[#000000B8] leading-[140%]">
                      *Grover, S. A., Lowensteyn, I., Kaouache, M., Marchand,
                      S., Coupal, L., DeCarolis, E., Zoccoli, J., and Assessing
                      the Cardiovascular Risk of Patients at Risk of Erectile
                      Dysfunction Study Group. (2006). Canadian Journal of
                      Urology.
                    </div>
                  )}

                  {popupConfig.buttons.map((button, index) => (
                    <button
                      key={index}
                      onClick={() => handleButtonClick(button)}
                      disabled={button.disabled}
                      className={`w-full h-[52px] ${
                        popupConfig.title === "You want something..."
                          ? "w-full"
                          : "max-w-sm"
                      }  py-3 items-center rounded-full font-medium transition-colors ${
                        button.primary
                          ? "bg-black text-white hover:bg-gray-800"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {button.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericPopup;
