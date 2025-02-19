CREATE TABLE IF NOT EXISTS transfer_events (
    transaction_hash VARCHAR(66) PRIMARY KEY,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    value BIGINT NOT NULL,
    block_number BIGINT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_block_number ON transfer_events (block_number);

CREATE INDEX IF NOT EXISTS idx_from_address ON transfer_events (from_address);

CREATE INDEX IF NOT EXISTS idx_to_address ON transfer_events (to_address);

CREATE INDEX IF NOT EXISTS idx_created_at ON transfer_events (created_at);