-- CreateTable
CREATE TABLE "Symbol" (
    "id" BIGSERIAL NOT NULL,
    "symbol_id" VARCHAR(20) NOT NULL,
    "display_symbol" VARCHAR(40) NOT NULL,
    "description" VARCHAR(120),
    "type" VARCHAR(40) NOT NULL,

    CONSTRAINT "Symbol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" BIGSERIAL NOT NULL,
    "symbol_id" VARCHAR(20) NOT NULL,
    "current_price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Symbol_symbol_id_key" ON "Symbol"("symbol_id");

-- CreateIndex
CREATE INDEX "Quote_symbol_id_created_at_idx" ON "Quote"("symbol_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_symbol_id_fkey" FOREIGN KEY ("symbol_id") REFERENCES "Symbol"("symbol_id") ON DELETE RESTRICT ON UPDATE CASCADE;
