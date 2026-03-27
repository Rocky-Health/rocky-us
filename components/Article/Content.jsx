import AdContainer from "./AdContainer";
import Author from "./Author";
import HtmlContent from "./HtmlContent";
import BlogSideNavigation from "@/components/Blogs/BlogSideNavigation";
import Loader from "@/components/Loader";
import { getAuthorSectionLabel } from "@/lib/constants/blogAuthorSectionLabels";

const Content = ({ html, loding = false, AuthorContent = null }) => {
  const authorSectionLabel = getAuthorSectionLabel({
    authorName: AuthorContent?.display_name,
    postLabel:
      AuthorContent?.author_section_label || AuthorContent?.section_label,
  });
  if (loding) {
    return <Loader />;
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-2">
        <div className="lg:col-span-3 col-span-12">
          <BlogSideNavigation html={html} loading={loding} />
        </div>
        <div className="lg:col-span-9 col-span-12 overflow-hidden">
          <HtmlContent className="mb-8 mt-4" html={html}></HtmlContent>

          <div className="flex justify-center content-center">
            <h2 className="w-full lg:w-[770px] text-gray-900 font-semibold text-base mt-6 mb-2">
              {authorSectionLabel}
            </h2>
          </div>

          <div className="flex justify-center content-center ">
            <Author
              name={AuthorContent?.display_name}
              avatarUrl={AuthorContent?.avatar_url}
              full_show={true}
              desc={AuthorContent?.description}
              avatarSize="h-[100px] w-[100px]"
            ></Author>
          </div>
        </div>
        {/* <div className="lg:col-span-3 col-span-12">
          <AdContainer />
        </div> */}
      </div>
    </>
  );
};

export default Content;
