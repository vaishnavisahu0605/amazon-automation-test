
import { Builder, By, Key, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import chromedriver from 'chromedriver';
import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';


setDefaultTimeout(120 * 1000);


let deviceInfo = {
  name: '',
  price: '',
  url: ''
};

Given('I am on the Amazon website', async function() {
  //this.driver = await new Builder().forBrowser('chrome').build();
  const service = new chrome.ServiceBuilder(chromedriver.path);
  this.driver = await new Builder()
  .forBrowser('chrome')
  .setChromeService(service)
  .build();
  
  await this.driver.manage().window().maximize();
  await this.driver.manage().deleteAllCookies();
  
  await this.driver.get('https://www.amazon.in');
  
  await this.driver.sleep(2000);
  const title = await this.driver.getTitle();
  if (title.toLowerCase().includes('robot check')) {
    console.log('⚠️ CAPTCHA detected. Please solve it manually in the browser...');
    await this.driver.sleep(30000); // Give user 30 seconds to solve CAPTCHA
  } else {
    try {
      const captchaCheck = await this.driver.findElements(By.css('form[action="/errors/validateCaptcha"]'));
      if (captchaCheck.length > 0) {
        console.log('⚠️ CAPTCHA form detected. Please solve it manually in the browser...');
        await this.driver.sleep(30000); // Wait 30s for manual CAPTCHA solving
      }
    } catch (e) {
      // Fallback — no need to handle error here
    }
  }
  try {
    const popupCloseButton = await this.driver.findElement(By.css("[data-action-type='DISMISS']"));
    await popupCloseButton.click();
    console.log('Closed initial popup');
  } catch (e) {
  }
});

When('I search for {string}', async function(searchTerm) {
  console.log(`Searching for: ${searchTerm}`);

  let searchBox = await this.driver.findElement(By.xpath('//input[@id="twotabsearchtextbox"]'));
  if (!searchBox) {
    throw new Error('Could not find search box on Amazon page');
  }
  
  await searchBox.clear();
  
  await searchBox.sendKeys(searchTerm, Key.RETURN);
  //console.log('Search submitted');
  
  await this.driver.wait(until.elementLocated(By.css('.s-result-item, .sg-col-inner')), 15000);
  console.log('Search results loaded successfully');
  
  await this.driver.sleep(2000);
});

When('I select the first iPhone from search results', async function() {
  await selectFirstSearchResult(this.driver, 'iPhone');
});

When('I select the first Galaxy device from search results', async function() {
  await selectFirstSearchResult(this.driver, 'Galaxy');
});

When('I should add the iPhone to cart', async function() {
  await attemptAddToCart(this.driver);
});

When('I should add the Galaxy device to cart', async function() {
  await attemptAddToCart(this.driver);
});

Then('I should view cart and verify price of iPhone',async function () {
  await navigateToCartAndVerifyPrice(this.driver)
})

Then('I should view cart and verify price of Galaxy',async function () {
  await navigateToCartAndVerifyPrice(this.driver)
})

// Helper function to select the first search result
async function selectFirstSearchResult(driver, productType) 
{
  console.log(`Selecting first ${productType} from search results`);
  try {
    const originalWindow = await driver.getWindowHandle();
    const resultSelectors = [
      By.css('.s-result-item:not(.AdHolder) .a-link-normal.s-no-outline'),
      By.css('.s-result-item h2 a'),
      By.css('.a-link-normal.a-text-normal'),
      By.xpath("//div[contains(@class, 's-result-item')]//h2//a"),
      By.css("a.a-link-normal")
    ];
    
    let firstResult = null;
    for (const selector of resultSelectors) {
      try {
        const results = await driver.findElements(selector);
        for (const result of results) {
          if (await result.isDisplayed()) {
            firstResult = result;
            break;
          }
        }
        if (firstResult) break;
      } catch (e) {
      }
    }
    
    if (!firstResult) {
      throw new Error(`Could not find a valid ${productType} search result`);
    }
    

    await firstResult.click();
    console.log('Clicked on search result');
    
    try {
      await driver.wait(until.elementLocated(By.id('productTitle')), 10000);
    } catch (e) {
      console.log('Could not find product title element, but continuing...');
    }
    
    const allWindows = await driver.getAllWindowHandles();
    for (const handle of allWindows) {
      if (handle !== originalWindow) {
        await driver.switchTo().window(handle);
        console.log('Switched to product detail tab');
        break;
      }
    }
    await driver.wait(until.elementLocated(By.id('productTitle')), 15000);
    await driver.sleep(3000);

    deviceInfo.url = await driver.getCurrentUrl();
    console.log(`Product page loadeded`);
  } catch (error) {
    console.error(`Error selecting ${productType} product:`, error);
    throw error;
  }
}

async function attemptAddToCart(driver) {
  console.log('Attempting to add product to cart');
  try {
    const addToCartSelectors = [
      By.id("add-to-cart-button"),
      By.css("#add-to-cart-button"),
      By.xpath("//input[@id='add-to-cart-button']"),
      By.xpath("//button[@id='add-to-cart-button']"),
      By.css("input#add-to-cart-button"),
      By.xpath("//span[@id='add-to-cart-button']"),
      By.css("input[type='submit'][name='submit.add-to-cart']"),
      By.xpath("//input[@aria-labelledby='attach-sidesheet-add-to-cart-button']"),
      By.css(".a-button-input[name='submit.add-to-cart']"),
      By.css(".a-button-text"), 
      By.css("span.a-button-inner input")
    ];

    let addToCartButton = null;
    let buttonFound = false;


    for (const selector of addToCartSelectors) {
      try {

        const buttons = await driver.findElements(selector);
        

        for (const button of buttons) {
          if (await button.isDisplayed()) {
            try {
              const buttonText = await button.getText() || 
                                await button.getAttribute("value") || 
                                await button.getAttribute("aria-label");
              
              if (buttonText && (
                  buttonText.toLowerCase().includes("add to cart") || 
                  buttonText.toLowerCase().includes("add to basket"))) {
                addToCartButton = button;
                buttonFound = true;
                break;
              }
            } catch (textError) {
              addToCartButton = button;
              buttonFound = true;
              break;
            }
          }
        }
        
        if (buttonFound) break;
        if (!addToCartButton) {
          addToCartButton = await driver.wait(until.elementLocated(selector), 5000);
          if (addToCartButton) {
            break;
          }
        }
      } catch (e) {
      }
    }

    if (!addToCartButton) {
      
      for (let scrollY = 200; scrollY < 2000; scrollY += 200) {
        await driver.executeScript(`window.scrollTo(0, ${scrollY});`);
        await driver.sleep(500);
        
        for (const selector of addToCartSelectors) {
          try {
            addToCartButton = await driver.findElement(selector);
            if (await addToCartButton.isDisplayed()) {
              break;
            }
          } catch (e) {
          }
        }
        
        if (addToCartButton) break;
      }
    }

    if (!addToCartButton) {
      throw new Error('Add to Cart button not found');
    }

   
    await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", addToCartButton);
    await driver.sleep(1500);
    await driver.executeScript("window.scrollBy(0, -100);"); 
    await driver.sleep(500);

    try {
      await driver.executeScript("arguments[0].click();", addToCartButton);
    } catch (jsClickError) {
      try {
        await addToCartButton.click();
      } catch (regularClickError) {
        throw new Error(`Failed to click Add to Cart button: ${regularClickError.message}`);
      }
    }


    try {
      await driver.wait(until.elementLocated(
        By.css('.sw-atc-confirmation-box, #attachSiNoCoverage, #siNoCoverage, #NATC_SMART_WAGON_CONF_MSG_SUCCESS')
      ), 10000);
      console.log('Add to Cart confirmation appeared');
    } catch (confirmError) {

    }

  } catch (error) {
    console.error('Error in Add to Cart flow:', error.message);
    throw error;
  }
}

async function navigateToCartAndVerifyPrice(driver) {
  await driver.sleep(10000);

  await driver.get('https://www.amazon.in/gp/cart/view.html');
  try {
    await driver.wait(until.elementLocated(By.id('sc-active-cart')), 10000);
    console.log('Cart page loaded successfully');
  } catch (e) {
    console.log('Could not find active cart element, but continuing...');
  }

  console.log('Retrieving the price...');  
    try{
    await driver.sleep(2000);
    
    let priceElement = null
    let priceText = "";
    try {
       priceElement = await driver.findElement(By.css(".sc-price"));  
              
          if (priceElement) {
            priceText = await priceElement[0].getAttribute('textContent') ;

          }
        } catch (e) {
           priceElement =  await driver.findElement(By.css('.sc-white-space-nowrap'));
          if (priceElement) {
            priceText = await priceElement.getAttribute('textContent') ; 
            deviceInfo.price = priceText;   
                
          }
        
        console.log(priceText);
        }
        
        

  } catch (error) {
    console.error('Error navigating to cart or retrieving price:', error);
    throw error;
  }}


