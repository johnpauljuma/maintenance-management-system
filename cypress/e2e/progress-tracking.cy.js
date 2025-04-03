describe("Task Progress Tracking Test", () => {
    it("should display the Status column in the My Requests table", () => {
      // Step 1: Visit the client login page
      cy.visit("https://maintenance-management-system-two.vercel.app/login");
  
      // Step 2: Enter login credentials
      cy.get("input[placeholder='Enter your email']").should("be.visible").type("jp0829673@gmail.com");
      cy.get("input[placeholder='Enter your password']").should("be.visible").type("123456");
      cy.get("button[type='submit']").click();
      
      // Step 3: Wait for the dashboard to load
      cy.wait(5000);
  
      // Step 4: Navigate to "My Requests" from the sidebar
      cy.contains("My Requests").click();
  
      // Step 5: Wait for the table to load
      cy.wait(3000);
  
      // Step 6: Verify that the Status column is visible in the table
      cy.contains("Status").should("be.visible");
    });
  });
  