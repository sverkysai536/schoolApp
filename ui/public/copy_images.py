import shutil
import os

src_kids = '/Users/sverky/.gemini/antigravity/brain/4d92f464-1347-4d88-ba42-ff9d90d055a8/school_kids_background_1771081758739.png'
dst_kids = '/Users/sverky/Documents/aiapp/ui/public/school_kids_background.png'

src_animals = '/Users/sverky/.gemini/antigravity/brain/4d92f464-1347-4d88-ba42-ff9d90d055a8/school_animals_background_1771081789472.png'
dst_animals = '/Users/sverky/Documents/aiapp/ui/public/school_animals_background.png'

print(f"Copying {src_kids} to {dst_kids}")
try:
    shutil.copy(src_kids, dst_kids)
    print("Success kids")
except Exception as e:
    print(f"Error kids: {e}")

print(f"Copying {src_animals} to {dst_animals}")
try:
    shutil.copy(src_animals, dst_animals)
    print("Success animals")
except Exception as e:
    print(f"Error animals: {e}")
