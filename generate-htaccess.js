const fs = require("fs");
const path = require("path");

// Define the correct .htaccess content for Next.js routing
const htaccessContent = `
RewriteEngine On

  RewriteBase / 
    #about/index.html
    RewriteRule ^about/$ about/index.html [L]
    #categories/Categories/index.html
    RewriteRule ^categories/Categories/$ categories/Categories/index.html [L]
    #categories/[slug]/index.html
    RewriteRule ^categories/([^/]+)/$ categories/[slug]/index.html [L]
    #categories/index.html
    RewriteRule ^categories/$ categories/index.html [L]
    #contact-us/index.html
    RewriteRule ^contact-us/$ contact-us/index.html [L]
    #featured/index.html
    RewriteRule ^featured/$ featured/index.html [L]
    #home/index.html
    RewriteRule ^home/$ home/index.html [L]
    #Rewrite for feature-products page
    RewriteRule ^feature-products/$ feature-products/index.html [L]
    #Rewrite for feature-products/[slug] pages
    RewriteRule ^feature-products/([^/]+)/$ feature-products/$1/index.html [L]
    #hot-deals/index.html
    RewriteRule ^hot-deals/$ hot-deals/index.html [L]
    #index.html
    RewriteRule ^index/$ index.html [L]
    #layout/index.html
    RewriteRule ^layout/$ layout/index.html [L]
    #notifications/index.html
    RewriteRule ^notifications/$ notifications/index.html [L]
    #offers/index.html
    RewriteRule ^offers/$ offers/index.html [L]
    #orderplaced/index.html
    RewriteRule ^orderplaced/$ orderplaced/index.html [L]
    #popular-dishes/index.html
    RewriteRule ^popular-dishes/$ popular-dishes/index.html [L]
    #privacy-policy/index.html
    RewriteRule ^privacy-policy/$ privacy-policy/index.html [L]
    #products/[slug]/index.html
    RewriteRule ^products/([^/]+)/$ products/[slug]/index.html [L]
    #products/index.html
    RewriteRule ^products/$ products/index.html [L]
    #terms-conditions/index.html
    RewriteRule ^terms-conditions/$ terms-conditions/index.html [L]
    #test/index.html
    RewriteRule ^test/$ test/index.html [L]
    #user/UserLayout/index.html
    RewriteRule ^user/UserLayout/$ user/UserLayout/index.html [L]
    #user/address/index.html
    RewriteRule ^user/address/$ user/address/index.html [L]
    #user/cart/index.html
    RewriteRule ^user/cart/$ user/cart/index.html [L]
    #user/coupons/index.html
    RewriteRule ^user/coupons/$ user/coupons/index.html [L]
    #user/favourites/index.html
    RewriteRule ^user/favourites/$ user/favourites/index.html [L]
    #user/my-orders/[id]/index.html
    RewriteRule ^user/my-orders/([^/]+)/$ user/my-orders/[id]/index.html [L]
    #user/my-orders/index.html
    RewriteRule ^user/my-orders/$ user/my-orders/index.html [L]
    #user/profile/index.html
    RewriteRule ^user/profile/$ user/profile/index.html [L]
    #user/refer/index.html
    RewriteRule ^user/refer/$ user/refer/index.html [L]
    #user/transactions/index.html
    RewriteRule ^user/transactions/$ user/transactions/index.html [L]
    #user/wallet/index.html
    RewriteRule ^user/wallet/$ user/wallet/index.html [L]
    RewriteCond %{REQUEST_FILENAME} !-f 

  RewriteCond %{REQUEST_FILENAME} !-d 

  RewriteRule ^(.*)$ /404/404.html [L]  
`;

// Define the target directory and file path
const distFolder = path.resolve(__dirname, "dist");
const outputPath = path.join(distFolder, ".htaccess");

// Ensure the `dist` folder exists
if (!fs.existsSync(distFolder)) {
  fs.mkdirSync(distFolder, { recursive: true });
}

// Write the .htaccess file in the `dist` folder
fs.writeFileSync(outputPath, htaccessContent, "utf8");
console.log(".htaccess file generated successfully in the dist folder");
