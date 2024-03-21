describe('template spec', () => {
  it('user page', () => {
    cy.visit('http://localhost:3000/user')

    cy.get('h5').contains("/user").click()

    cy.on('window:alert', (t)=>{
      //assertions
      expect(t).to.equal(1);
   })

   cy.get('input').should('have.value', "start")
   cy.wait(1000)
   cy.get('input').clear()
   cy.wait(1000)
   cy.get('input').type("hello word")
   cy.get('input').should('have.value', "hello word")
   cy.get('ul').children().its('length').should('equal', 5)
  })
});

// describe('Navigation', () => {
//   it('should navigate to the about page', () => {
//     // Start from the index page
//     cy.visit('http://localhost:3000/')
 
//     // Find a link with an href attribute containing "about" and click it
//     cy.get('a[href*="about"]').click()
 
//     // The new url should include "/about"
//     cy.url().should('include', '/about')
 
//     // The new page should contain an h1 with "About"
//     cy.get('h1').contains('About')
//   })
// })