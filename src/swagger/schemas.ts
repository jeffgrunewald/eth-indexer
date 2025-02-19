/**
 * @swagger
 * components:
 *   schemas:
 *     TransferEvent:
 *       type: object
 *       properties:
 *         from:
 *           type: string
 *         to:
 *           type: string
 *         value:
 *           type: string
 *         transaction_hash:
 *           type: string
 *         block_number:
 *           type: integer
 *         timestamp:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *     
 *     Pagination:
 *       type: object
 *       properties:
 *         currentPage:
 *           type: integer
 *         pageSize:
 *           type: integer
 *         totalPages:
 *           type: integer
 *         totalItems:
 *           type: integer
 *     
 *     TransferStats:
 *       type: object
 *       properties:
 *         totalEvents:
 *           type: integer
 *         totalTransferred:
 *           type: string
 *         lastEventAt:
 *           type: string
 *           format: date-time
 */ 