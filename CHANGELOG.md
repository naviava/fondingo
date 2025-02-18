# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Expense audit log system for tracking changes to expenses
- Settlement audit log system for tracking changes to settlements
- Incremental debt calculation using audit logs for improved performance
- New `ExpenseAuditLog` table in database schema for tracking expense history
- New `SettlementAuditLog` table in database schema for tracking settlement history
- New indices on `groupId`, `expenseId`, and `createdAt` for expense audit log queries
- New indices on `groupId`, `settlementId`, and `createdAt` for settlement audit log queries

### Changed

- Optimized debt calculations to process only new changes since last calculation
- Improved handling of expense and settlement updates/deletions with audit trail
- Enhanced group debt calculation with proper chronological ordering
- Removed full recalculation requirement for expense and settlement modifications
- **BREAKING**: Complete data reset required for this update
- **BREAKING**: Database schema changes require migration

### Fixed

- Type safety improvements in debt calculation code
- Fixed inefficient debt recalculation on settlement modifications

## [0.1.0] - 2024-06-13

- Initial release of the application

[unreleased]: https://github.com/naviava/fondingo/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/naviava/fondingo/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/naviava/fondingo/releases/tag/v0.1.0
