"use client";

import { useState, useEffect, useRef } from "react";
import { logger } from "@/utils/devLogger";

import TitleSection from "@/components/Blogs/TitleSection";
import ContentSection from "@/components/Blogs/ContentSection";
import Section from "@/components/utils/Section";
import CategoryBtnsWrapper from "@/components/Blogs/CategoryBtnsWrapper";
import BlogsWrapper from "@/components/Blogs/BlogsWrapper";
import Pagination from "@/components/Blogs/Pagination";
import MoreQuestions from "@/components/MoreQuestions";

export default function BlogsPage() {
    const [categories, setCategories] = useState([]);
    const [totalPages, setTotalPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [blogLoading, setBlogLoading] = useState(true);
    const [selectedCategoryId, setSelectedCategoryId] = useState("0");
    const topRef = useRef(null);

    const fetchBlogs = async (currentPage, categories = null) => {
        try {
            setBlogLoading(true);
            var url = "/api/blogs?page=" + currentPage;
            if (categories != null) {
                url += "&categories=" + categories;
            }
            const res = await fetch(url);
            const data = await res.json();

            const pageNumbers = Array.from(
                { length: parseInt(res.headers.get("TotalPages")) },
                (_, index) => index + 1
            );

            setBlogs(data);
            setCurrentPage(currentPage);
            setTotalPages(pageNumbers);
        } catch (error) {
            logger.error("Error fetching blogs:", error);
        } finally {
            setLoading(false);
            setBlogLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/BlogCategories");
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            logger.error("Error fetching categories:", error);
        } finally {
            //  setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchBlogs(
            currentPage,
            selectedCategoryId != "0" ? selectedCategoryId : null
        );
    }, [currentPage, selectedCategoryId]);

    const handleCategoryClick = (categoryId) => {
        setCurrentPage("1");
        setSelectedCategoryId(categoryId);
    };

    const goToPage = (pageNo) => {
        const nextPageNo = pageNo.selected + 1;

        if (nextPageNo > totalPages.length) {
            return;
        }
        setCurrentPage(nextPageNo);
        setTimeout(() => {
            topRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 0);
    };

    return (
        <main>
            <Section>
                <TitleSection></TitleSection>
                <ContentSection ref={topRef}>
                    <CategoryBtnsWrapper
                        selectedCategoryId={selectedCategoryId}
                        onCategoryClick={handleCategoryClick}
                        categories={categories}
                        loading={loading}
                    ></CategoryBtnsWrapper>
                </ContentSection>
                <ContentSection>
                    <BlogsWrapper
                        Blogs={blogs.length > 0 ? blogs : []}
                        loading={blogLoading}
                    ></BlogsWrapper>
                </ContentSection>
                <Pagination
                    Pages={totalPages}
                    currentPage={currentPage}
                    goToPage={goToPage}
                ></Pagination>
                <MoreQuestions
                    title="Join 350K+ Customers & receive actionable health tips."
                    buttonText="Sign up to our newsletter"
                    buttonWidth="240"
                ></MoreQuestions>
            </Section>
        </main>
    );
}
