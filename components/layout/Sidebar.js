"use client";

import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const Sidebar = ({ menuItems }) => {
  const [expanded, setExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState("");
  const pathname = usePathname();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 1024;
      setIsMobile(isMobileView);
      if (isMobileView && !mobileOpen) {
        setExpanded(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileOpen]);

  // Find active accordion based on current path
  useEffect(() => {
    const activeGroup = menuItems.findIndex((item) =>
      item.children?.some((child) => child.href === pathname)
    );
    if (activeGroup !== -1) {
      setActiveAccordion(`item-${activeGroup}`);
    }
  }, [pathname, menuItems]);

  const renderMenuItem = ({ item, index, isChild = false }) => {
    const isActive = pathname === item.href;

    return (
      <Button
        key={item.href} // Add key here
        variant="ghost"
        className={`
          w-full justify-start mb-1 relative group
          ${isActive ? "bg-accent/50" : "hover:bg-accent/20"}
          ${expanded ? "px-4" : "px-2"}
          ${isChild ? "text-sm" : ""}
          transition-all duration-200
        `}
        asChild
      >
        <Link href={item.href}>
          <div
            key={`content-${item.href}`} // Add key here
            className={`
              flex items-center gap-2
              ${isActive ? "text-primary" : "text-muted-foreground"}
              group-hover:text-primary
              transition-colors duration-200
            `}
          >
            {item.icon && (
              <div
                key={`icon-${item.href}`} // Add key here
                className={`
                  p-2 rounded-lg
                  ${isActive ? "bg-primary/10" : "group-hover:bg-primary/5"}
                  transition-colors duration-200
                `}
              >
                <item.icon className="h-4 w-4" />
              </div>
            )}
            {(expanded || isMobile) && (
              <span
                key={`title-${item.href}`} // Add key here
                className={`
                  ${isActive ? "font-medium" : ""}
                  transition-all duration-200
                `}
              >
                {item.title}
              </span>
            )}

          </div>
        </Link>
      </Button>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        h-screen bg-background border-r
        transition-all duration-300 ease-in-out
        ${expanded ? "w-64" : "w-20"}
        ${isMobile ? "fixed inset-y-0 left-0 z-40" : "relative"}
        ${mobileOpen ? "translate-x-0" : isMobile ? "-translate-x-full" : ""}
      `}
      >
        {/* Header */}
        <div className="flex items-center h-14 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className={`
              ${isMobile ? "hidden" : ""}
              hover:bg-accent/50 transition-colors duration-200
            `}
          >
            {expanded ? (
              <ChevronLeft className="h-4 w-4 transition-transform duration-200" />
            ) : (
              <ChevronRight className="h-4 w-4 transition-transform duration-200" />
            )}
          </Button>

          {expanded && (
            <span className="font-semibold ml-2 text-primary">
              Control Panel
            </span>
          )}
        </div>

        {/* Menu Items */}
        <ScrollArea className="h-[calc(100vh-3.5rem)]">
          <div className="p-2">
            <Accordion
              type="single"
              collapsible
              className="space-y-1"
              value={activeAccordion}
              onValueChange={setActiveAccordion}
            >
              {menuItems.map((item, index) =>
                item.children ? (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border-none"
                  >
                    <AccordionTrigger
                      className={`
                      flex items-center px-4 py-2 rounded-lg
                      hover:bg-accent/20 
                      data-[state=open]:bg-accent/30
                      transition-all duration-200
                    `}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`
                          p-2 rounded-lg
                          ${
                            activeAccordion === `item-${index}`
                              ? "bg-primary/10"
                              : ""
                          }
                          transition-colors duration-200
                        `}
                        >
                          <item.icon
                            className={`
                            h-4 w-4
                            ${
                              activeAccordion === `item-${index}`
                                ? "text-primary"
                                : "text-muted-foreground"
                            }
                          `}
                          />
                        </div>
                        {(expanded || isMobile) && (
                          <span
                            className={`
                            text-sm
                            ${
                              activeAccordion === `item-${index}`
                                ? "text-primary font-medium"
                                : "text-muted-foreground"
                            }
                          `}
                          >
                            {item.title}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-4 space-y-1">
                        {item.children.map((child, childIndex) =>
                          renderMenuItem({
                            item: child,
                            index: `${index}-${childIndex}`,
                            isChild: true,
                          })
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ) : (
                  renderMenuItem({ item, index })
                )
              )}
            </Accordion>
          </div>
        </ScrollArea>
      </div>

      {/* Mobile Toggle Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 hover:bg-accent/50"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      )}
    </>
  );
};

export default Sidebar;
