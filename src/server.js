// backend/server.js
app.post('/create-checkout-session', async (req, res) => {
  const { items } = req.body; // Listan på varor från frontenden

  // Här mappar ni varorna från varukorgen till Stripes format
  const lineItems = items.map(item => {
    // VIKTIGT: Hämta priset från er databas här baserat på item.id 
    // lita aldrig på priset som skickas från frontend!
    return {
      price_data: {
        currency: 'sek',
        product_data: {
          name: item.name, // t.ex. 'Blå t-shirt'
        },
        unit_amount: item.price * 100, // Stripe vill ha ören (200 kr = 20000)
      },
      quantity: item.quantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: 'http://localhost:8080/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'http://localhost:8080/cart',
  });

  res.json({ url: session.url });
});