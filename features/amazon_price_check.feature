Feature: Amazon Device Price Check
  As an online shopper
  I want to check the prices of mobile devices on Amazon
  So that I can make informed purchasing decisions

  @iphone
  Scenario: Check iPhone price on Amazon
    Given I am on the Amazon website
    When I search for "iPhone"
    And I select the first iPhone from search results
    And I should add the iPhone to cart
    Then I should view cart and verify price of iPhone
   

  @galaxy
  Scenario: Check Samsung Galaxy price on Amazon
    Given I am on the Amazon website
    When I search for "Samsung Galaxy"
    And I select the first Galaxy device from search results
    And I should add the Galaxy device to cart
    Then I should view cart and verify price of Galaxy
  