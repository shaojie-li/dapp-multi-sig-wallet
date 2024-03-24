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

   cy.get('input').invoke('val', 25).trigger("change").get('input').should('have.value', "25")
  })
});
