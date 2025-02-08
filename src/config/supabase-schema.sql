-- Alter existing loan_applications table
ALTER TABLE public.loan_applications
  ADD COLUMN IF NOT EXISTS amount decimal,
  ADD COLUMN IF NOT EXISTS duration integer,
  ADD COLUMN IF NOT EXISTS monthly_payment decimal,
  ADD COLUMN IF NOT EXISTS total_repayment decimal,
  ADD COLUMN IF NOT EXISTS employment_details jsonb,
  ADD COLUMN IF NOT EXISTS documents jsonb,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'PENDING_REVIEW';

-- Add constraints if they don't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_loan_type') THEN
    ALTER TABLE public.loan_applications
      ADD CONSTRAINT valid_loan_type 
      CHECK (loan_type in ('GRZ', 'SALARY_ADVANCE', 'BUSINESS', 'PERSONAL'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_status') THEN
    ALTER TABLE public.loan_applications
      ADD CONSTRAINT valid_status 
      CHECK (status in ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PROCESSING'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'positive_amount') THEN
    ALTER TABLE public.loan_applications
      ADD CONSTRAINT positive_amount 
      CHECK (amount > 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'positive_duration') THEN
    ALTER TABLE public.loan_applications
      ADD CONSTRAINT positive_duration 
      CHECK (duration > 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'positive_monthly_payment') THEN
    ALTER TABLE public.loan_applications
      ADD CONSTRAINT positive_monthly_payment 
      CHECK (monthly_payment > 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'positive_total_repayment') THEN
    ALTER TABLE public.loan_applications
      ADD CONSTRAINT positive_total_repayment 
      CHECK (total_repayment > 0);
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS loan_applications_user_id_idx ON public.loan_applications(user_id);
CREATE INDEX IF NOT EXISTS loan_applications_status_idx ON public.loan_applications(status);
CREATE INDEX IF NOT EXISTS loan_applications_created_at_idx ON public.loan_applications(created_at); 