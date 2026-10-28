ALTER TABLE public.foods ADD COLUMN IF NOT EXISTS image_path text;
CREATE POLICY food_photo_read_authenticated ON storage.objects FOR SELECT TO authenticated USING(bucket_id='foods');
CREATE POLICY food_photo_admin_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='foods' AND public.es_admin());
CREATE POLICY food_photo_admin_delete ON storage.objects FOR DELETE TO authenticated USING(bucket_id='foods' AND public.es_admin());