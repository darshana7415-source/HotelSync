StaffSync deploy notes

Manual Netlify upload:
Upload the zip contents as the site root. The zip already contains index.html at the top level.

GitHub Netlify deploy:
Use publish directory: outputs/hotelstaff
Build command: leave blank

After deploy, test:
/VERSION.txt should show StaffSync build v118.
/index.html?v=118 should open the app.
