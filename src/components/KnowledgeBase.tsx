"use client";

import React, { useMemo } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Search, Globe, FileText, Tag } from "lucide-react";

interface KnowledgeBaseProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  websiteUrl: string;
  setWebsiteUrl: (url: string) => void;
  pageUrl: string;
  setPageUrl: (url: string) => void;
  scrapeResult: string | null;
  setScrapeResult: (result: string | null) => void;
  isScrapingWebsite: boolean;
  setIsScrapingWebsite: (scraping: boolean) => void;
  isScrapingPage: boolean;
  setIsScrapingPage: (scraping: boolean) => void;
}

export function KnowledgeBase({
  searchTerm,
  setSearchTerm,
  websiteUrl,
  setWebsiteUrl,
  pageUrl,
  setPageUrl,
  scrapeResult,
  setScrapeResult,
  isScrapingWebsite,
  setIsScrapingWebsite,
  isScrapingPage,
  setIsScrapingPage,
}: KnowledgeBaseProps) {

  const documents = useQuery(api.knowledgeBase.getAllDocuments);
  const searchResults = useQuery(
    api.knowledgeBase.searchDocuments,
    searchTerm ? { searchTerm } : "skip"
  );
  
  const scrapeWebsite = useAction(api.firecrawl.scrapeWebsite);
  const scrapePage = useAction(api.firecrawl.scrapePage);
  const deleteDocument = useMutation(api.knowledgeBase.deleteDocument);

  const displayedDocuments = useMemo(() => {
    return searchTerm ? searchResults : documents;
  }, [searchTerm, searchResults, documents]);
  
  const isLoading = searchTerm ? searchResults === undefined : documents === undefined;

  const handleScrapeWebsite = async () => {
    if (!websiteUrl.trim()) return;
    
    setIsScrapingWebsite(true);
    setScrapeResult(null);
    
    try {
      const result = await scrapeWebsite({
        url: websiteUrl,
        options: {
          crawlerOptions: {
            maxDepth: 2,
            limit: 10,
          },
          pageOptions: {
            onlyMainContent: true,
            includeHtml: false,
          },
        },
      });
      
      if (result.success) {
        setScrapeResult(`✅ Successfully scraped and stored ${result.documentsStored} documents`);
        setWebsiteUrl("");
      } else {
        setScrapeResult(`❌ Scraping failed: ${result.error}`);
      }
    } catch (error) {
      setScrapeResult(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsScrapingWebsite(false);
    }
  };

  const handleScrapePage = async () => {
    if (!pageUrl.trim()) return;
    
    setIsScrapingPage(true);
    setScrapeResult(null);
    
    try {
      const result = await scrapePage({
        url: pageUrl,
        options: {
          onlyMainContent: true,
          includeHtml: false,
        },
      });
      
      if (result.success) {
        setScrapeResult(`✅ Successfully scraped "${result.title}" (${result.contentLength} characters)`);
        setPageUrl("");
      } else {
        setScrapeResult(`❌ Scraping failed: ${result.error}`);
      }
    } catch (error) {
      setScrapeResult(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsScrapingPage(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocument({ id: id as any });
      } catch (error) {
        console.error("Failed to delete document:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Scraping Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Knowledge Base Management
          </CardTitle>
          <CardDescription>
            Scrape websites and pages using Firecrawl API to build your support knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Website Scraping */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Scrape Entire Website
            </h3>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/docs"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isScrapingWebsite}
              />
              <Button
                onClick={handleScrapeWebsite}
                disabled={isScrapingWebsite || !websiteUrl.trim()}
                className="min-w-[120px]"
              >
                {isScrapingWebsite ? "Scraping..." : "Scrape Site"}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Crawls up to 10 pages with max depth of 2 levels
            </p>
          </div>

          {/* Single Page Scraping */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Scrape Single Page
            </h3>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/specific-page"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isScrapingPage}
              />
              <Button
                onClick={handleScrapePage}
                disabled={isScrapingPage || !pageUrl.trim()}
                className="min-w-[120px]"
              >
                {isScrapingPage ? "Scraping..." : "Scrape Page"}
              </Button>
            </div>
          </div>

          {/* Scrape Result */}
          {scrapeResult && (
            <div className={`p-3 rounded-md text-sm ${
              scrapeResult.startsWith("✅") 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {scrapeResult}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Knowledge Base Documents
          </CardTitle>
          <CardDescription>
            Search and manage your scraped documents ({isLoading ? "loading..." : `${documents?.length || 0} total`})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Documents List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading documents...</span>
            </div>
          ) : !displayedDocuments || displayedDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No documents found matching your search." : "No documents in knowledge base. Start by scraping a website or page above."}
            </div>
          ) : (
            <div className="space-y-3">
              {displayedDocuments.map((doc) => (
                <div key={doc._id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-1">{doc.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span>Created: {new Date(doc.createdAt).toLocaleDateString()}</span>
                        <span>Content: {doc.content.length} chars</span>
                      </div>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {doc.url}
                        </a>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Tag className="w-3 h-3 text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Content Preview */}
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {doc.content.substring(0, 200)}
                      {doc.content.length > 200 && "..."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
