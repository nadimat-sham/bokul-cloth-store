-- Starter catalogue. Edit freely from /admin afterwards.
INSERT INTO categories (slug, name, headline, description, sort_order) VALUES
('women', 'Women', 'Sarees, three-pieces & kurtis',
 'Everyday cotton sarees, block-printed three-pieces and easy kurtis for work, study and festive evenings.', 1),
('men', 'Men', 'Panjabis, shirts & trousers',
 'Cotton panjabis for Eid and weddings, shirts for the office and relaxed chinos and polos for the weekend.', 2),
('kids', 'Kids', 'Frocks, panjabis & tees',
 'Soft, breathable clothes for children aged 2 to 10 — made for play, school and family occasions.', 3),
('accessories', 'Accessories', 'Ornas & gamchas',
 'Finishing pieces: printed chiffon ornas and handloom cotton gamchas.', 4);

INSERT INTO products (slug, name, category_id, summary, description, fabric, care, color, price, compare_at_price, image, featured) VALUES
('ivory-jamdani-weave-cotton-saree', 'Ivory Jamdani-Weave Cotton Saree', 1,
 'A light cotton saree with a woven jamdani-style motif and a gold-toned border.',
 'Woven in breathable cotton, this ivory saree carries a scattered jamdani-style motif across the body and a gold-toned border along the pallu. It drapes softly, stays cool through a Dhaka afternoon and works equally well for office days and family dawats. Comes with an unstitched blouse piece.',
 '100% cotton', 'Gentle hand wash in cold water; dry in shade; iron on medium.', 'Ivory & gold', 3450, 3950, '/images/products/ivory-jamdani-weave-cotton-saree.svg', 1),
('midnight-georgette-party-saree', 'Midnight Georgette Party Saree', 1,
 'A flowing navy georgette saree with a fine sequinned border for evening events.',
 'A deep midnight-navy georgette saree that falls in clean pleats, finished with a fine sequinned border that catches the light without feeling heavy. A dependable choice for weddings, receptions and Eid evenings. Includes an unstitched matching blouse piece.',
 'Georgette', 'Dry clean recommended.', 'Midnight navy', 4650, NULL, '/images/products/midnight-georgette-party-saree.svg', 1),
('indigo-block-print-three-piece', 'Indigo Block-Print Three-Piece', 1,
 'Stitched cotton lawn kameez, salwar and orna in an indigo block print.',
 'A ready-to-wear three-piece in soft cotton lawn: a straight-cut kameez with an indigo block print, matching salwar and a lightweight printed orna. Easy to wear from morning classes to evening visits.',
 'Cotton lawn', 'Machine wash cold on gentle; wash dark colours separately.', 'Indigo & white', 2650, 2950, '/images/products/indigo-block-print-three-piece.svg', 1),
('rose-garden-printed-kurti', 'Rose Garden Printed Kurti', 1,
 'A relaxed viscose kurti with an all-over floral print and three-quarter sleeves.',
 'This everyday kurti has a relaxed A-line cut, three-quarter sleeves and an all-over rose print. The viscose fabric feels soft and drapes well — pair it with leggings, palazzos or jeans.',
 'Viscose', 'Hand wash cold; do not wring; iron on low.', 'Blush pink', 1450, NULL, '/images/products/rose-garden-printed-kurti.svg', 0),
('sage-linen-blend-tunic', 'Sage Linen-Blend Tunic', 1,
 'A minimal sage-green tunic in a breathable linen blend with side slits.',
 'A clean, minimal tunic in a breathable linen-cotton blend, with a band collar, side slits and a straight hem. Its muted sage tone is easy to style for the office or weekends.',
 'Linen-cotton blend', 'Machine wash cold; iron while slightly damp.', 'Sage green', 1850, NULL, '/images/products/sage-linen-blend-tunic.svg', 0),
('classic-ivory-cotton-panjabi', 'Classic Ivory Cotton Panjabi', 2,
 'A clean-cut ivory panjabi in fine cotton with subtle tonal stitching.',
 'Our signature panjabi: fine-count cotton, a regular fit, a mandarin collar and subtle tonal stitching on the placket. It is comfortable enough for Jummah and smart enough for Eid mornings and weddings.',
 'Fine cotton', 'Machine wash cold; iron on medium.', 'Ivory', 2250, NULL, '/images/products/classic-ivory-cotton-panjabi.svg', 1),
('maroon-embroidered-eid-panjabi', 'Maroon Embroidered Eid Panjabi', 2,
 'A festive maroon panjabi with gold-thread embroidery on the collar and placket.',
 'A festive panjabi in rich maroon with gold-thread embroidery around the collar and down the placket. Cut in a soft cotton-silk blend with a regular fit for Eid, weddings and holud evenings.',
 'Cotton-silk blend', 'Dry clean recommended.', 'Maroon & gold', 3250, 3650, '/images/products/maroon-embroidered-eid-panjabi.svg', 1),
('oxford-blue-formal-shirt', 'Oxford Blue Formal Shirt', 2,
 'A crisp long-sleeve oxford-weave shirt for the office.',
 'A smart long-sleeve shirt in a cotton oxford weave with a button-down collar and a tailored-regular fit. Holds its shape through a long workday and pairs easily with chinos or formal trousers.',
 'Cotton oxford', 'Machine wash cold; iron on medium-high.', 'Light blue', 1650, NULL, '/images/products/oxford-blue-formal-shirt.svg', 0),
('olive-check-casual-shirt', 'Olive Check Casual Shirt', 2,
 'A soft brushed-cotton check shirt for relaxed weekends.',
 'A relaxed shirt in brushed cotton with an olive and cream check, a single chest pocket and a curved hem that works tucked or untucked.',
 'Brushed cotton', 'Machine wash cold; tumble dry low.', 'Olive check', 1450, NULL, '/images/products/olive-check-casual-shirt.svg', 0),
('navy-pique-polo', 'Navy Piqué Polo', 2,
 'A breathable cotton piqué polo with a two-button placket.',
 'An everyday polo in breathable cotton piqué with a ribbed collar, two-button placket and side vents. Comfortable in the heat and neat enough for casual Fridays.',
 'Cotton piqué', 'Machine wash cold; do not bleach.', 'Navy', 990, NULL, '/images/products/navy-pique-polo.svg', 0),
('stone-cotton-chino-trousers', 'Stone Cotton Chino Trousers', 2,
 'Slim-straight chinos in a soft stretch cotton twill.',
 'Slim-straight chinos in cotton twill with a little stretch for comfort, finished with slant pockets and a clean flat front. Sized by waist in inches.',
 'Cotton twill, 2% elastane', 'Machine wash cold inside out.', 'Stone beige', 1750, NULL, '/images/products/stone-cotton-chino-trousers.svg', 0),
('little-bokul-floral-frock', 'Little Bokul Floral Frock', 3,
 'A twirly cotton frock printed with small bokul flowers.',
 'Our namesake print: tiny cream bokul flowers scattered over a soft cotton frock with a gathered skirt, puff sleeves and a back button closure. Lined for comfort.',
 '100% cotton, cotton lining', 'Machine wash cold on gentle.', 'Coral', 1150, 1350, '/images/products/little-bokul-floral-frock.svg', 1),
('kids-mustard-panjabi-set', 'Kids Mustard Panjabi Set', 3,
 'A cotton panjabi and pyjama set in festive mustard.',
 'A two-piece set for little ones: a mustard cotton panjabi with contrast piping and matching white pyjama with an elastic waist. Ready for Eid and family gatherings.',
 'Cotton', 'Machine wash cold; iron on medium.', 'Mustard & white', 1350, NULL, '/images/products/kids-mustard-panjabi-set.svg', 0),
('kids-graphic-cotton-tee', 'Kids Graphic Cotton Tee', 3,
 'A soft crew-neck tee with a playful printed graphic.',
 'A soft crew-neck t-shirt in combed cotton jersey with a playful front print. Easy to wash, easy to wear, made for everyday play.',
 'Combed cotton jersey', 'Machine wash cold inside out.', 'Sky blue', 550, NULL, '/images/products/kids-graphic-cotton-tee.svg', 0),
('printed-chiffon-orna', 'Printed Chiffon Orna', 4,
 'A light, airy chiffon orna with a soft floral print.',
 'A full-length chiffon orna with a soft floral print and finished edges. Light enough to layer over kurtis and three-pieces all year round.',
 'Chiffon', 'Hand wash cold; dry in shade.', 'Peach floral', 650, NULL, '/images/products/printed-chiffon-orna.svg', 0),
('handloom-cotton-gamcha', 'Handloom Cotton Gamcha', 4,
 'A traditional checked gamcha woven on handlooms.',
 'A traditional checked gamcha in absorbent handloom cotton. Use it as a towel, a travel wrap or a scarf — it softens with every wash.',
 'Handloom cotton', 'Machine or hand wash; colours may bleed in the first wash.', 'Red & green check', 350, NULL, '/images/products/handloom-cotton-gamcha.svg', 0);

INSERT INTO product_sizes (product_id, size, stock, sort_order)
SELECT p.id, s.size, s.stock, s.ord FROM products p JOIN (
  SELECT 'ivory-jamdani-weave-cotton-saree' slug, 'Free size' size, 12 stock, 1 ord UNION ALL
  SELECT 'midnight-georgette-party-saree','Free size',6,1 UNION ALL
  SELECT 'indigo-block-print-three-piece','S',5,1 UNION ALL SELECT 'indigo-block-print-three-piece','M',8,2 UNION ALL
  SELECT 'indigo-block-print-three-piece','L',8,3 UNION ALL SELECT 'indigo-block-print-three-piece','XL',4,4 UNION ALL
  SELECT 'rose-garden-printed-kurti','S',6,1 UNION ALL SELECT 'rose-garden-printed-kurti','M',10,2 UNION ALL
  SELECT 'rose-garden-printed-kurti','L',9,3 UNION ALL SELECT 'rose-garden-printed-kurti','XL',5,4 UNION ALL
  SELECT 'sage-linen-blend-tunic','S',4,1 UNION ALL SELECT 'sage-linen-blend-tunic','M',6,2 UNION ALL
  SELECT 'sage-linen-blend-tunic','L',6,3 UNION ALL SELECT 'sage-linen-blend-tunic','XL',0,4 UNION ALL
  SELECT 'classic-ivory-cotton-panjabi','M',10,1 UNION ALL SELECT 'classic-ivory-cotton-panjabi','L',12,2 UNION ALL
  SELECT 'classic-ivory-cotton-panjabi','XL',10,3 UNION ALL SELECT 'classic-ivory-cotton-panjabi','XXL',6,4 UNION ALL
  SELECT 'maroon-embroidered-eid-panjabi','M',5,1 UNION ALL SELECT 'maroon-embroidered-eid-panjabi','L',7,2 UNION ALL
  SELECT 'maroon-embroidered-eid-panjabi','XL',6,3 UNION ALL SELECT 'maroon-embroidered-eid-panjabi','XXL',3,4 UNION ALL
  SELECT 'oxford-blue-formal-shirt','M',8,1 UNION ALL SELECT 'oxford-blue-formal-shirt','L',8,2 UNION ALL
  SELECT 'oxford-blue-formal-shirt','XL',6,3 UNION ALL SELECT 'oxford-blue-formal-shirt','XXL',3,4 UNION ALL
  SELECT 'olive-check-casual-shirt','M',6,1 UNION ALL SELECT 'olive-check-casual-shirt','L',7,2 UNION ALL
  SELECT 'olive-check-casual-shirt','XL',5,3 UNION ALL
  SELECT 'navy-pique-polo','S',6,1 UNION ALL SELECT 'navy-pique-polo','M',12,2 UNION ALL
  SELECT 'navy-pique-polo','L',12,3 UNION ALL SELECT 'navy-pique-polo','XL',8,4 UNION ALL
  SELECT 'stone-cotton-chino-trousers','30',5,1 UNION ALL SELECT 'stone-cotton-chino-trousers','32',8,2 UNION ALL
  SELECT 'stone-cotton-chino-trousers','34',8,3 UNION ALL SELECT 'stone-cotton-chino-trousers','36',4,4 UNION ALL
  SELECT 'little-bokul-floral-frock','2-3Y',5,1 UNION ALL SELECT 'little-bokul-floral-frock','4-5Y',6,2 UNION ALL
  SELECT 'little-bokul-floral-frock','6-7Y',5,3 UNION ALL SELECT 'little-bokul-floral-frock','8-9Y',3,4 UNION ALL
  SELECT 'kids-mustard-panjabi-set','2-3Y',4,1 UNION ALL SELECT 'kids-mustard-panjabi-set','4-5Y',6,2 UNION ALL
  SELECT 'kids-mustard-panjabi-set','6-7Y',6,3 UNION ALL SELECT 'kids-mustard-panjabi-set','8-9Y',4,4 UNION ALL
  SELECT 'kids-graphic-cotton-tee','2-3Y',8,1 UNION ALL SELECT 'kids-graphic-cotton-tee','4-5Y',10,2 UNION ALL
  SELECT 'kids-graphic-cotton-tee','6-7Y',10,3 UNION ALL SELECT 'kids-graphic-cotton-tee','8-9Y',8,4 UNION ALL
  SELECT 'printed-chiffon-orna','Free size',15,1 UNION ALL
  SELECT 'handloom-cotton-gamcha','Free size',30,1
) s ON s.slug = p.slug;
