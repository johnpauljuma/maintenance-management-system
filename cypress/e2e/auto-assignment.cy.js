describe("Auto Assignment Test", () => {
    it("should automatically assign a new request to a technician",() => {
        cy.visit("https://maintenance-management-system-two.vercel.app/technician-login");
    
        cy.get("input[placeholder='Enter your Technician ID']").type("001");
        cy.get("input[placeholder='Enter your password']").type("123456");
        cy.get("button[type='submit']").click();

        cy.wait(10000);

        cy.contains("Tasks").click();
        cy.wait(5000);
        // Step 2: Wait for the page to reload and check for success message
        cy.contains("Auto-assignment completed. Notifications sent.").should("be.visible");
        
});
  });
  