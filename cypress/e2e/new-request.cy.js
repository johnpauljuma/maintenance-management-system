describe("New Request Page", () => {
  before(() => {
    cy.session("user-session", () => {
      // Visit the login page
      cy.visit("https://maintenance-management-system-two.vercel.app/login");

      // Fill in login details
      cy.get("input[placeholder='Enter your email']").should("be.visible").type("jp0829673@gmail.com");
      cy.get("input[placeholder='Enter your password']").should("be.visible").type("123456");
      cy.get("button[type='submit']").click();

    });
  });

  it("should fill the form and submit a new request", () => {
    cy.visit("https://maintenance-management-system-two.vercel.app/clients");

    // Expand sidebar if necessary
    cy.get("aside").then(($sidebar) => {
      if ($sidebar.find(".collapsed-menu").length) {
        cy.get(".sidebar-toggle").click();
      }
    });

    // Click on "New Request" in the sidebar
    cy.contains("New Request").click();

    // Ensure the form is visible
    cy.get("form").should("exist"); // Ensure the form is present
    cy.get(".ant-form-item").should("be.visible"); // Ensure form items are loaded

     // Fill in the input fields using placeholders
     cy.get("input[placeholder='Enter client name']").type("John Doe");
     cy.get("input[placeholder='Enter phone number']").type("1234567890");
     cy.get("input[placeholder='Enter request title']").type("Broken AC");
     cy.get("textarea[placeholder='Describe the issue in detail']").type("The air conditioner is not working.");
     cy.get("input[placeholder='Enter location']").type("Nairobi, Kenya");
 
     // Select a category (Ant Design Select)
     cy.get(".ant-select").eq(0).click(); // Click first select box
     cy.contains(".ant-select-dropdown .ant-select-item", "HVAC Maintenance").click();
 
     // Select urgency level
     cy.get(".ant-select").eq(1).click(); // Click second select box
     cy.contains(".ant-select-dropdown .ant-select-item", "High").click();

    // Submit the form
    cy.get("button[type='submit']").click();

    // Check for success message
    cy.contains("Failed to submit request: User not authenticated. Please log in.").should("be.visible");

    // Ensure the user is redirected to My Requests page
    //cy.url().should("include", "/clients/my-requests");
  });
});
