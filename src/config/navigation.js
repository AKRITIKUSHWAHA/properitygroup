/**
 * Navigation Configuration
 * Master Specification Part 4 & 5.1
 */

import { approvedServices } from './services';

export const navigationLinks = [
  {
    name: "Home",
    path: "/",
    exact: true
  },
  {
    name: "Survey Services",
    path: "/services",
    isDropdown: true,
    children: approvedServices.map(service => ({
      name: service.name,
      shortName: service.shortName,
      path: service.path,
      description: service.tagline
    }))
  },
  {
    name: "Expert Witness",
    path: "/expert-witness",
    badge: "Disputes & Litigation"
  },
  {
    name: "Contact",
    path: "/contact"
  }
];

export const footerQuickLinks = [
  { name: "Home", path: "/" },
  { name: "Expert Witness Services", path: "/expert-witness" },
  { name: "Regional Service Coverage", path: "/contact#coverage" },
  { name: "Direct Contact & Enquiries", path: "/contact" }
];

export const footerServiceLinks = approvedServices.map(s => ({
  name: s.name,
  path: s.path
}));

export const footerCoverageLinks = [
  { name: "London Property Surveys", path: "/contact?area=london" },
  { name: "Surrey Building Surveys", path: "/contact?area=surrey" },
  { name: "Oxfordshire Property Valuations", path: "/contact?area=oxfordshire" },
  { name: "Buckinghamshire Snagging Reports", path: "/contact?area=buckinghamshire" },
  { name: "Berkshire Damp Investigations", path: "/contact?area=berkshire" }
];

