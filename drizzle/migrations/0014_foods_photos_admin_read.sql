DROP POLICY IF EXISTS food_photo_read_authenticated ON storage.objects;
DROP POLICY IF EXISTS foods_images_read ON storage.objects;
CREATE POLICY foods_images_admin_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'foods' AND public.es_admin());