ALTER TABLE contents 
ADD COLUMN share_token uuid UNIQUE DEFAULT NULL;

CREATE POLICY "Public read by share token"
ON contents FOR SELECT
USING (share_token IS NOT NULL);

CREATE POLICY "Public read flashcards by share token"
ON flashcards FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM contents 
    WHERE contents.id = flashcards.content_id 
    AND contents.share_token IS NOT NULL
  )
);
