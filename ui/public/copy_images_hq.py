
import shutil
import os

# New HQ images
src_kids = '/Users/sverky/.gemini/antigravity/brain/4d92f464-1347-4d88-ba42-ff9d90d055a8/school_kids_background_hq_1771084321900.png'
dst_kids = '/Users/sverky/Documents/aiapp/ui/public/school_kids_background.png'

src_animals = '/Users/sverky/.gemini/antigravity/brain/4d92f464-1347-4d88-ba42-ff9d90d055a8/school_animals_background_hq_1771084338111.png'
dst_animals = '/Users/sverky/Documents/aiapp/ui/public/school_animals_background.png'

shutil.copy(src_kids, dst_kids)
shutil.copy(src_animals, dst_animals)

# Create login background from kids background (fallback/reuse)
dst_login = '/Users/sverky/Documents/aiapp/ui/public/school_login_background.png'
shutil.copy(src_kids, dst_login)
