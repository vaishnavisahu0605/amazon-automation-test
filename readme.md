# 🛒 Amazon Device Price Tests

An automated E2E test suite that checks prices of mobile devices (like iPhones or Samsung Galaxy phones) on [Amazon.in](https://www.amazon.in). Built using:

- **Selenium WebDriver**
- **Cucumber.js**
- **ES Modules + Node.js**
- **Parallel execution**

---

## Quick Navigation

- [Features](#features)
- [Technical Decisions](#technical-decisions)
- [Setup Instructions](#setup)
- [Run the Tests](#running-tests)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

-  Automated search for devices (e.g. iPhone, Galaxy)
-  Price retrieval from Amazon product detail page
-  Adds product to cart and verifies price
-  Parallel execution with separate tags
-  Cucumber BDD-style test steps and scenarios
-  Logs and console output for debugging

---

##  Technical Decisions

###  Tools Chosen

| Tool              | Reason                                                                 |
|-------------------|------------------------------------------------------------------------|
| `selenium-webdriver` | Industry-standard for browser automation                              |
| `@cucumber/cucumber` | Gherkin syntax for human-readable tests + step reusability           |
| `chromedriver`     | Enables automation in Google Chrome                                   |
| `JavaScript (ESM)` | Modern syntax and async/await support                                 |

###  Testing Strategy

- Uses **Gherkin** scenarios with tags `@iphone`, `@galaxy`
- Each product is tested in a **separate parallel process**
- Searches for the product, opens the detail page in a new tab, scrolls & clicks the “Add to Cart” button
- Navigates to cart and validates that price appears correctly

---

## Setup

```bash
npm install
```

```bash
npm run parallel

```

