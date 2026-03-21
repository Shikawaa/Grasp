ALTER TABLE contents
ADD COLUMN audio_url text DEFAULT NULL;

-- Create the audio bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Users can upload their own audio" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can read audio" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'audio');

CREATE POLICY "Users can update their own audio"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);
