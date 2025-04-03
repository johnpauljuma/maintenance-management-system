describe("Real Time Communication and Notification", () => {
    it("should check if the client can receive real-time notification", () => {
      // Step 1: Visit the client login page
      cy.visit("https://maintenance-management-system-two.vercel.app/login");
  
      // Step 2: Enter login credentials
      cy.get("input[placeholder='Enter your email']").should("be.visible").type("jp0829673@gmail.com");
      cy.get("input[placeholder='Enter your password']").should("be.visible").type("123456");
      cy.get("button[type='submit']").click();
      
      // Step 3: Wait for the dashboard to load
      cy.wait(5000);
  
      // Step 4: Navigate to "My Requests" from the sidebar
      cy.contains("Notifications").click();
  
      // Step 5: Wait for the table to load
      cy.wait(3000);
  
      // Step 6: Verify that the Status column is visible in the table
      cy.contains("Read").should("be.visible");
    });

    it("should check if the technician can receive real-time notification", () => {
        // Step 1: Visit the client login page
        cy.visit("https://maintenance-management-system-two.vercel.app/technician-login");
    
        // Step 2: Enter login credentials
        cy.get("input[placeholder='Enter your Technician ID']").should("be.visible").type("001");
        cy.get("input[placeholder='Enter your password']").should("be.visible").type("123456");
        cy.get("button[type='submit']").click();
        
        // Step 3: Wait for the dashboard to load
        cy.wait(5000);
    
        // Step 4: Navigate to "My Requests" from the sidebar
        cy.contains("Notifications").click();
    
        // Step 5: Wait for the table to load
        cy.wait(3000);
    
        // Step 6: Verify that the Status column is visible in the table
        cy.contains("Read").should("be.visible");
      });

      it("should check if the admin can receive real-time notification", () => {
        // Step 1: Visit the client login page
        cy.visit("https://maintenance-management-system-two.vercel.app/admin-login");
    
        // Step 2: Enter login credentials
        cy.get("input[placeholder='Enter your email']").should("be.visible").type("jumajohnpa@gmail.com");
        cy.get("input[placeholder='Enter your password']").should("be.visible").type("123456");
        cy.get("button[type='submit']").click();
        
        // Step 3: Wait for the dashboard to load
        cy.wait(5000);
    
        // Step 4: Navigate to "My Requests" from the sidebar
        cy.contains("Notifications").click();
    
        // Step 5: Wait for the table to load
        cy.wait(3000);
    
        // Step 6: Verify that the Status column is visible in the table
        cy.contains("Read").should("be.visible");
      });
  });
  