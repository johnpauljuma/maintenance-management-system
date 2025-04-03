describe("Authentication Tests", () => {
    const userEmail = "jp0829673@gmail.com";
    const userPassword = "123456";
  
    it("TC01: Verify that a user can log in with valid credentials", () => {
      cy.visit("https://maintenance-management-system-two.vercel.app/login");
  
      // Fill login form
      cy.get("input[placeholder='Enter your email']").type(userEmail);
      cy.get("input[placeholder='Enter your password']").type(userPassword);
      cy.get("button[type='submit']").click();
  
      // Assert successful login
      cy.url().should("include", "/clients");
    });
  
    it("TC02: Verify that a user cannot log in with incorrect credentials", () => {
      cy.visit("https://maintenance-management-system-two.vercel.app/login");
  
      // Fill login form with incorrect credentials
      cy.get("input[placeholder='Enter your email']").type("wronguser@gmail.com");
      cy.get("input[placeholder='Enter your password']").type("wrongpassword");
      cy.get("button[type='submit']").click();
  
      // Assert error message is displayed
      cy.contains("Invalid login credentials").should("be.visible");
    });        
      
  });
  